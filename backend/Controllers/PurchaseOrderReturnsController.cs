using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Inventory;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/purchase-order-returns")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PurchaseOrderReturnsController : ControllerBase
{
    private readonly VeraDbContext _db;
    public PurchaseOrderReturnsController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.PurchaseOrderReturns, Permission.Read)]
    public async Task<ActionResult<IEnumerable<PurchaseReturn>>> GetAll()
        => Ok(await _db.PurchaseReturns.Include(r => r.PurchaseOrder).ThenInclude(po => po.Supplier)
            .Include(r => r.Sku).OrderByDescending(r => r.ReturnDate).AsNoTracking().ToListAsync());

    // Logs defective/rejected stock, computes the credit note from the PO's
    // unit cost, decrements stock, and writes an immutable RETURN movement log.
    [HttpPost, RequiresPermission(NavPageIds.PurchaseOrderReturns, Permission.Create)]
    public async Task<ActionResult<PurchaseReturn>> Create(CreateReturnRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length < 3)
            return BadRequest(new { message = "A reason is required." });

        var poItem = await _db.PurchaseOrderItems
            .Include(i => i.Sku).Include(i => i.PurchaseOrder)
            .FirstOrDefaultAsync(i => i.PurchaseOrderId == request.PurchaseOrderId && i.SkuId == request.SkuId);
        if (poItem is null) return NotFound(new { message = "No matching line item on that purchase order." });

        var refund = poItem.UnitCost * request.Quantity;
        poItem.Sku.CurrentStock = Math.Max(0, poItem.Sku.CurrentStock - request.Quantity);

        var ret = new PurchaseReturn
        {
            PurchaseOrderId = request.PurchaseOrderId,
            SkuId = request.SkuId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            TotalRefundAmount = refund,
        };
        _db.PurchaseReturns.Add(ret);

        _db.StockMovementLogs.Add(new StockMovementLog
        {
            SkuId = request.SkuId,
            MovementType = MovementType.Return,
            ReferenceId = request.PurchaseOrderId,
            QuantityChanged = -request.Quantity,
            StockAfterChange = poItem.Sku.CurrentStock,
            PerformedByUserId = CurrentUserId(),
            Notes = $"{poItem.PurchaseOrder.PoNumber} return — {request.Reason}",
        });

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), ret);
    }

    private long CurrentUserId() =>
        long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
