using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Data;

namespace VeraApi.Controllers;

// Base for straightforward reference-data entities (categories, suppliers,
// services, etc). Derived controllers add [HttpGet]/[HttpPost]/... plus
// [RequiresPermission] on each overridden action so permission checks stay
// page-specific — see e.g. ProductCategoriesController below.
[ApiController]
[Authorize]
public abstract class CrudControllerBase<TEntity, TKey> : ControllerBase where TEntity : class
{
    protected readonly VeraDbContext Db;
    protected DbSet<TEntity> Set => Db.Set<TEntity>();

    protected CrudControllerBase(VeraDbContext db) => Db = db;

    protected abstract TKey GetId(TEntity entity);

    public virtual async Task<ActionResult<IEnumerable<TEntity>>> GetAll()
        => Ok(await Set.AsNoTracking().ToListAsync());

    public virtual async Task<ActionResult<TEntity>> GetById(TKey id)
    {
        var entity = await Set.FindAsync(id);
        return entity is null ? NotFound() : Ok(entity);
    }

    public virtual async Task<ActionResult<TEntity>> Create(TEntity entity)
    {
        Set.Add(entity);
        await Db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = GetId(entity) }, entity);
    }

    public virtual async Task<IActionResult> Update(TKey id, TEntity entity)
    {
        if (!Equals(GetId(entity), id)) return BadRequest(new { message = "Route id and body id do not match." });
        Db.Entry(entity).State = EntityState.Modified;
        await Db.SaveChangesAsync();
        return NoContent();
    }

    public virtual async Task<IActionResult> Delete(TKey id)
    {
        var entity = await Set.FindAsync(id);
        if (entity is null) return NotFound();
        Set.Remove(entity);
        await Db.SaveChangesAsync();
        return NoContent();
    }
}
