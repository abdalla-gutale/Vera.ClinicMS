using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Billing;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/billing")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class BillingController : ControllerBase
{
    private readonly VeraDbContext _db;
    public BillingController(VeraDbContext db) => _db = db;

    [HttpGet("invoices"), RequiresPermission(NavPageIds.BillingInvoices, Permission.Read)]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        => Ok(await _db.Invoices.Include(i => i.Patient).OrderByDescending(i => i.CreatedAt).AsNoTracking().ToListAsync());

    // Mixes services + OTC products into a single invoice. Applies whichever
    // active system discount matches today's date unless a manual discount is
    // supplied, computes VAT off ClinicSettings.VatRate, deducts stock for the
    // direct product lines (DIRECT_SALE movement), and credits the chosen
    // account for the full amount (checkout invoices are marked PAID immediately).
    [HttpPost("walk-in-checkout"), RequiresPermission(NavPageIds.BillingInvoices, Permission.Create)]
    public async Task<ActionResult<CheckoutResult>> WalkinCheckout(WalkinCheckoutRequest request)
    {
        var account = await ValidateAccountForMethod(request.AccountId, request.PaymentMethod);
        if (account is null) return BadRequest(new { message = "Selected account does not match the chosen payment method." });

        var services = await _db.Services.Where(s => request.ServiceIds.Contains(s.ServiceId)).ToListAsync();
        var skuIds = request.Products.Select(p => p.SkuId).ToList();
        var skus = await _db.ProductSkus.Where(s => skuIds.Contains(s.SkuId)).ToListAsync();

        var serviceSum = services.Sum(s => s.BasePrice);
        var productSum = request.Products.Sum(p => skus.First(s => s.SkuId == p.SkuId).UnitPrice * p.Quantity);
        var subTotal = serviceSum + productSum;

        var (discountAmount, discountId) = await ResolveDiscount(subTotal, request.ManualDiscount);
        var settings = await _db.ClinicSettings.FirstAsync();
        var taxable = Math.Max(0, subTotal - discountAmount);
        var taxAmount = taxable * (settings.VatRate / 100m);
        var grandTotal = taxable + taxAmount;

        var invoiceNumber = await NextInvoiceNumber();
        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            PatientId = request.PatientId,
            Channel = InvoiceChannel.WalkIn,
            SubTotal = subTotal,
            DiscountId = discountId,
            ManualDiscount = discountAmount,
            TaxAmount = taxAmount,
            GrandTotal = grandTotal,
            PaymentStatus = PaymentStatus.Paid,
            InvoiceServices = services.Select(s => new InvoiceService { ServiceId = s.ServiceId, UnitPrice = s.BasePrice }).ToList(),
            InvoiceProducts = request.Products.Select(p => new InvoiceProduct
            {
                SkuId = p.SkuId,
                Quantity = p.Quantity,
                UnitPrice = skus.First(s => s.SkuId == p.SkuId).UnitPrice,
            }).ToList(),
        };
        _db.Invoices.Add(invoice);

        var userId = CurrentUserId();
        foreach (var line in request.Products)
        {
            var sku = skus.First(s => s.SkuId == line.SkuId);
            sku.CurrentStock = Math.Max(0, sku.CurrentStock - line.Quantity);
            _db.StockMovementLogs.Add(new StockMovementLog
            {
                SkuId = sku.SkuId,
                MovementType = MovementType.DirectSale,
                QuantityChanged = -line.Quantity,
                StockAfterChange = sku.CurrentStock,
                PerformedByUserId = userId,
                Notes = $"Sold on Invoice {invoiceNumber}",
            });
        }

        account!.CurrentBalance += grandTotal;
        _db.PatientPayments.Add(new PatientPayment
        {
            Invoice = invoice,
            AccountId = account.AccountId,
            AmountPaid = grandTotal,
            PaymentMethod = request.PaymentMethod,
            ReceivedByUserId = userId,
        });

        await _db.SaveChangesAsync();
        return Ok(new CheckoutResult(invoice.InvoiceId, invoiceNumber, subTotal, discountAmount, taxAmount, grandTotal, PaymentStatus.Paid));
    }

    // Bills a single completed-but-unbilled cycle on an active patient plan.
    // FIXED_PACKAGE plans bill an even installment (TotalPrice / NumberOfSessions);
    // PER_VISIT plans bill the actual session's assigned services/products.
    // Reduces PatientTreatmentPlan.BalanceRemaining by the pre-tax amount.
    [HttpPost("cycle-checkout"), RequiresPermission(NavPageIds.BillingInvoices, Permission.Create)]
    public async Task<ActionResult<CheckoutResult>> CycleCheckout(CycleCheckoutRequest request)
    {
        var account = await ValidateAccountForMethod(request.AccountId, request.PaymentMethod);
        if (account is null) return BadRequest(new { message = "Selected account does not match the chosen payment method." });

        var patientPlan = await _db.PatientTreatmentPlans.Include(p => p.Plan).ThenInclude(p => p.Sessions)
            .ThenInclude(s => s.AssignedServices).ThenInclude(x => x.Service)
            .Include(p => p.Plan).ThenInclude(p => p.Sessions).ThenInclude(s => s.AssignedProducts).ThenInclude(x => x.Sku)
            .FirstOrDefaultAsync(p => p.PatientPlanId == request.PatientPlanId);
        if (patientPlan is null || patientPlan.Status != PatientPlanStatus.Active)
            return BadRequest(new { message = "Patient plan not found or not active." });

        var cycle = await _db.PlanCycles.FindAsync(request.CycleId);
        if (cycle is null || cycle.Status != CycleStatus.Completed)
            return BadRequest(new { message = "Cycle must be COMPLETED before it can be billed." });
        if (await _db.Invoices.AnyAsync(i => i.CycleId == request.CycleId))
            return Conflict(new { message = "This cycle has already been invoiced." });

        var session = patientPlan.Plan.Sessions.First(s => s.SessionId == cycle.SessionId);
        var subTotal = patientPlan.Plan.PlanType == TreatmentPlanType.FixedPackage
            ? patientPlan.Plan.TotalPrice / patientPlan.Plan.NumberOfSessions
            : session.AssignedServices.Sum(x => x.Service.BasePrice) + session.AssignedProducts.Sum(x => x.Sku.UnitPrice * x.Quantity);

        var settings = await _db.ClinicSettings.FirstAsync();
        var taxAmount = subTotal * (settings.VatRate / 100m);
        var grandTotal = subTotal + taxAmount;

        var invoiceNumber = await NextInvoiceNumber();
        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            PatientId = patientPlan.PatientId,
            PatientPlanId = patientPlan.PatientPlanId,
            CycleId = cycle.CycleId,
            Channel = InvoiceChannel.Cycle,
            SubTotal = subTotal,
            TaxAmount = taxAmount,
            GrandTotal = grandTotal,
            PaymentStatus = PaymentStatus.Paid,
            InvoiceServices = session.AssignedServices.Select(x => new InvoiceService { ServiceId = x.ServiceId, UnitPrice = x.Service.BasePrice }).ToList(),
        };
        _db.Invoices.Add(invoice);

        patientPlan.BalanceRemaining = Math.Max(0, patientPlan.BalanceRemaining - subTotal);

        account!.CurrentBalance += grandTotal;
        _db.PatientPayments.Add(new PatientPayment
        {
            Invoice = invoice,
            AccountId = account.AccountId,
            AmountPaid = grandTotal,
            PaymentMethod = request.PaymentMethod,
            ReceivedByUserId = CurrentUserId(),
        });

        await _db.SaveChangesAsync();
        return Ok(new CheckoutResult(invoice.InvoiceId, invoiceNumber, subTotal, 0, taxAmount, grandTotal, PaymentStatus.Paid));
    }

    private async Task<AccountSetup?> ValidateAccountForMethod(int accountId, string paymentMethod)
    {
        var account = await _db.AccountSetups.FindAsync(accountId);
        if (account is null || !account.IsActive) return null;
        if (!PaymentMethodAccountMap.Map.TryGetValue(paymentMethod, out var requiredType)) return null;
        return account.AccountType == requiredType ? account : null;
    }

    private async Task<(decimal amount, int? discountId)> ResolveDiscount(decimal subTotal, decimal manualDiscount)
    {
        if (manualDiscount > 0) return (manualDiscount, null);

        var today = DateTime.UtcNow.Date;
        var active = await _db.DiscountConfigurations
            .Where(d => d.IsActive && d.StartDate <= today && d.EndDate >= today)
            .FirstOrDefaultAsync();
        if (active is null) return (0, null);

        var amount = active.DiscountType == "PERCENTAGE" ? subTotal * (active.Value / 100m) : active.Value;
        return (amount, active.DiscountId);
    }

    private async Task<string> NextInvoiceNumber()
    {
        var count = await _db.Invoices.CountAsync();
        return $"VERA-INV-{1039 + count + 1}";
    }

    private long CurrentUserId() =>
        long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
