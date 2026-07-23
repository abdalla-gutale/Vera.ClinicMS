using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Inventory;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/purchase-orders")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly VeraDbContext _db;
    public PurchaseOrdersController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.PurchaseOrders, Permission.Read)]
    public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetAll()
        => Ok(await _db.PurchaseOrders.Include(p => p.Supplier).Include(p => p.Items).ThenInclude(i => i.Sku)
            .OrderByDescending(p => p.OrderDate).AsNoTracking().ToListAsync());

    [HttpGet("{id}"), RequiresPermission(NavPageIds.PurchaseOrders, Permission.Read)]
    public async Task<ActionResult<PurchaseOrder>> GetById(long id)
    {
        var po = await _db.PurchaseOrders.Include(p => p.Supplier).Include(p => p.Items).ThenInclude(i => i.Sku)
            .FirstOrDefaultAsync(p => p.PurchaseOrderId == id);
        return po is null ? NotFound() : Ok(po);
    }

    // Builds a DRAFT purchase order from supplier + SKU lines, auto-calculating
    // line totals and the grand total — matches the PO Builder modal.
    [HttpPost, RequiresPermission(NavPageIds.PurchaseOrders, Permission.Create)]
    public async Task<ActionResult<PurchaseOrder>> Create(CreatePurchaseOrderRequest request)
    {
        if (request.Lines is null || request.Lines.Count == 0)
            return BadRequest(new { message = "At least one line item is required." });

        var poCount = await _db.PurchaseOrders.CountAsync();
        var po = new PurchaseOrder
        {
            SupplierId = request.SupplierId,
            PoNumber = $"PO-VR-{2200 + poCount + 1}",
            OrderStatus = PurchaseOrderStatus.Draft,
            OrderDate = DateTime.UtcNow,
            ExpectedDeliveryDate = request.ExpectedDeliveryDate,
            TotalAmount = request.Lines.Sum(l => l.OrderedQuantity * l.UnitCost),
            Items = request.Lines.Select(l => new PurchaseOrderItem
            {
                SkuId = l.SkuId,
                OrderedQuantity = l.OrderedQuantity,
                UnitCost = l.UnitCost,
                ReceivedQuantity = 0,
            }).ToList(),
        };

        _db.PurchaseOrders.Add(po);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = po.PurchaseOrderId }, po);
    }

    [HttpPost("{id}/mark-ordered"), RequiresPermission(NavPageIds.PurchaseOrders, Permission.Update)]
    public async Task<IActionResult> MarkOrdered(long id)
    {
        var po = await _db.PurchaseOrders.FindAsync(id);
        if (po is null) return NotFound();
        if (po.OrderStatus != PurchaseOrderStatus.Draft)
            return BadRequest(new { message = "Only DRAFT purchase orders can be marked as ORDERED." });

        po.OrderStatus = PurchaseOrderStatus.Ordered;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Receive goods against one or more line items. For each line:
    //  - increases ProductSku.CurrentStock
    //  - optionally updates ProductSku.UnitPrice (selling price) when SellingPrice is supplied
    //  - writes an immutable StockMovementLog (PO_RECEIVE)
    // Then recomputes the PO's pipeline status: PARTIAL vs RECEIVED.
    [HttpPost("{id}/receive-goods"), RequiresPermission(NavPageIds.PurchaseOrders, Permission.Update)]
    public async Task<ActionResult<PurchaseOrder>> ReceiveGoods(long id, ReceiveGoodsRequest request)
    {
        var po = await _db.PurchaseOrders.Include(p => p.Items).ThenInclude(i => i.Sku)
            .FirstOrDefaultAsync(p => p.PurchaseOrderId == id);
        if (po is null) return NotFound();

        var userId = CurrentUserId();

        foreach (var line in request.Lines)
        {
            var item = po.Items.FirstOrDefault(i => i.PoItemId == line.PoItemId);
            if (item is null) continue;

            var remaining = item.OrderedQuantity - item.ReceivedQuantity;
            var qty = Math.Max(0, Math.Min(line.ReceivedQuantityNow, remaining));
            if (qty > 0)
            {
                item.Sku.CurrentStock += qty;
                item.ReceivedQuantity += qty;

                _db.StockMovementLogs.Add(new StockMovementLog
                {
                    SkuId = item.SkuId,
                    MovementType = MovementType.PoReceive,
                    ReferenceId = po.PurchaseOrderId,
                    QuantityChanged = qty,
                    StockAfterChange = item.Sku.CurrentStock,
                    PerformedByUserId = userId,
                    Notes = $"{po.PoNumber} goods receipt",
                });
            }

            if (line.SellingPrice is decimal newPrice && newPrice >= 0)
                item.Sku.UnitPrice = newPrice;
        }

        var fullyReceived = po.Items.All(i => i.ReceivedQuantity >= i.OrderedQuantity);
        var anyReceived = po.Items.Any(i => i.ReceivedQuantity > 0);
        po.OrderStatus = fullyReceived ? PurchaseOrderStatus.Received
            : anyReceived ? PurchaseOrderStatus.Partial
            : po.OrderStatus;

        await _db.SaveChangesAsync();
        return Ok(po);
    }

    private long CurrentUserId() =>
        long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
