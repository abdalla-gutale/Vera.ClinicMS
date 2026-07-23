using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;

namespace VeraApi.Controllers;

[Route("api/stock-movements")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class StockMovementsController : ControllerBase
{
    private readonly VeraDbContext _db;
    public StockMovementsController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.StockMovements, Permission.Read)]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] string? movementType, [FromQuery] string? skuCode,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _db.StockMovementLogs.Include(m => m.Sku).ThenInclude(s => s.Product).AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(movementType) && movementType != "ALL")
            query = query.Where(m => m.MovementType == movementType);
        if (!string.IsNullOrWhiteSpace(skuCode))
            query = query.Where(m => m.Sku.SkuCode.Contains(skuCode) || m.Sku.Product.ProductName.Contains(skuCode));
        if (from is not null) query = query.Where(m => m.MovementDate >= from);
        if (to is not null) query = query.Where(m => m.MovementDate <= to);

        var results = await query.OrderByDescending(m => m.MovementDate).ToListAsync();
        return Ok(results);
    }
}
