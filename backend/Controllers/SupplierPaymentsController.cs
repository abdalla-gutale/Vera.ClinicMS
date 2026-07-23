using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Inventory;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/supplier-payments")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class SupplierPaymentsController : ControllerBase
{
    private readonly VeraDbContext _db;
    public SupplierPaymentsController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.SupplierPayments, Permission.Read)]
    public async Task<ActionResult<IEnumerable<SupplierPayment>>> GetAll()
        => Ok(await _db.SupplierPayments.Include(p => p.Supplier).Include(p => p.PurchaseOrder).Include(p => p.Account)
            .OrderByDescending(p => p.PaymentDate).AsNoTracking().ToListAsync());

    // Ledger summary per supplier: Total Billed, Total Paid, Outstanding —
    // backs the "Supplier Statements" seal cards in the UI.
    [HttpGet("ledger"), RequiresPermission(NavPageIds.Suppliers, Permission.Read)]
    public async Task<ActionResult<object>> GetLedger()
    {
        var suppliers = await _db.Suppliers.AsNoTracking().ToListAsync();
        var pos = await _db.PurchaseOrders.Where(p => p.OrderStatus != PurchaseOrderStatus.Draft && p.OrderStatus != PurchaseOrderStatus.Cancelled)
            .AsNoTracking().ToListAsync();
        var payments = await _db.SupplierPayments.AsNoTracking().ToListAsync();

        var result = suppliers.Select(s =>
        {
            var supplierPos = pos.Where(p => p.SupplierId == s.SupplierId).ToList();
            var billed = supplierPos.Sum(p => p.TotalAmount);
            var paid = payments.Where(p => p.SupplierId == s.SupplierId).Sum(p => p.AmountPaid);
            return new
            {
                s.SupplierId,
                s.SupplierName,
                Billed = billed,
                Paid = paid,
                Balance = billed - paid,
                PoCount = supplierPos.Count,
            };
        });

        return Ok(result);
    }

    // Logs a payment against a PO. Validates the chosen Account's AccountType
    // matches the payment mode (Cash -> Cash Box, Bank Transfer/Cheque -> Bank
    // Account, Card -> POS/Merchant) — the same rule enforced client-side, but
    // never trust the client alone. Updates PurchaseOrder.PaidAmount and
    // deducts the account's CurrentBalance.
    [HttpPost, RequiresPermission(NavPageIds.SupplierPayments, Permission.Create)]
    public async Task<ActionResult<SupplierPayment>> Create(CreateSupplierPaymentRequest request)
    {
        var po = await _db.PurchaseOrders.FindAsync(request.PurchaseOrderId);
        if (po is null) return NotFound(new { message = "Purchase order not found." });

        var account = await _db.AccountSetups.FindAsync(request.AccountId);
        if (account is null || !account.IsActive) return BadRequest(new { message = "Account not found or inactive." });

        if (!PaymentMethodAccountMap.Map.TryGetValue(request.PaymentMode, out var requiredType) || account.AccountType != requiredType)
            return BadRequest(new { message = $"A {request.PaymentMode} payment must be paid from a {requiredType ?? "matching"} account." });

        var balance = po.TotalAmount - po.PaidAmount;
        if (request.AmountPaid <= 0 || request.AmountPaid > balance)
            return BadRequest(new { message = "Payment amount must be positive and not exceed the outstanding balance." });

        po.PaidAmount += request.AmountPaid;
        account.CurrentBalance -= request.AmountPaid;

        var payment = new SupplierPayment
        {
            SupplierId = po.SupplierId,
            PurchaseOrderId = po.PurchaseOrderId,
            AccountId = account.AccountId,
            AmountPaid = request.AmountPaid,
            PaymentMode = request.PaymentMode,
            Notes = request.Notes,
            ReceivedByUserId = CurrentUserId(),
        };
        _db.SupplierPayments.Add(payment);

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), payment);
    }

    private long CurrentUserId() =>
        long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
