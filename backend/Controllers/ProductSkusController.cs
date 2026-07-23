using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Inventory;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/product-skus")]
public class ProductSkusController : CrudControllerBase<ProductSku, long>
{
    public ProductSkusController(VeraDbContext db) : base(db) { }
    protected override long GetId(ProductSku e) => e.SkuId;

    [HttpGet, RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override async Task<ActionResult<IEnumerable<ProductSku>>> GetAll()
        => Ok(await Db.ProductSkus.Include(s => s.Product).ThenInclude(p => p.Category).AsNoTracking().ToListAsync());

    [HttpGet("{id}"), RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override Task<ActionResult<ProductSku>> GetById(long id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.Products, Permission.Create)]
    public override Task<ActionResult<ProductSku>> Create(ProductSku entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Products, Permission.Update)]
    public override Task<IActionResult> Update(long id, ProductSku entity) => base.Update(id, entity);

    // Manual stock addition / subtraction / expiry / damage write-off.
    // A reason is mandatory — enforced here even if the client forgets to.
    [HttpPost("{id}/adjust"), RequiresPermission(NavPageIds.Products, Permission.Update)]
    public async Task<ActionResult<ProductSku>> AdjustStock(long id, StockAdjustmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length < 3)
            return BadRequest(new { message = "A reason of at least 3 characters is required for stock adjustments." });
        if (request.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be positive." });

        var sku = await Db.ProductSkus.FindAsync(id);
        if (sku is null) return NotFound();

        var delta = request.AdjustmentType == AdjustmentType.Addition ? request.Quantity : -request.Quantity;
        sku.CurrentStock = Math.Max(0, sku.CurrentStock + delta);

        var userId = CurrentUserId();

        Db.StockAdjustments.Add(new StockAdjustment
        {
            SkuId = id,
            AdjustmentType = request.AdjustmentType,
            Quantity = request.Quantity,
            Reason = request.Reason,
            PerformedByUserId = userId,
        });
        Db.StockMovementLogs.Add(new StockMovementLog
        {
            SkuId = id,
            MovementType = MovementType.Adjustment,
            ReferenceId = null,
            QuantityChanged = delta,
            StockAfterChange = sku.CurrentStock,
            PerformedByUserId = userId,
            Notes = request.Reason,
        });

        await Db.SaveChangesAsync();
        return Ok(sku);
    }

    // Full movement history for one SKU — backs the audit drawer in the UI.
    [HttpGet("{id}/movements"), RequiresPermission(NavPageIds.StockMovements, Permission.Read)]
    public async Task<ActionResult<IEnumerable<StockMovementLog>>> GetMovements(long id)
        => Ok(await Db.StockMovementLogs.Where(m => m.SkuId == id).OrderByDescending(m => m.MovementDate).AsNoTracking().ToListAsync());

    private long CurrentUserId() =>
        long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
}
