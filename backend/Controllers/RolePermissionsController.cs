using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Patients;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/role-permissions")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class RolePermissionsController : ControllerBase
{
    private readonly VeraDbContext _db;
    public RolePermissionsController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.RolesPermissions, Permission.Read)]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        => Ok(await _db.Roles.AsNoTracking().ToListAsync());

    // Step 2 of the UI flow: "select a role, then show its page permissions".
    // Returns every NavPage with that role's CRUD flags (defaulting to all-false
    // if no row exists yet for that role/page pair).
    [HttpGet("role/{roleId}"), RequiresPermission(NavPageIds.RolesPermissions, Permission.Read)]
    public async Task<ActionResult<IEnumerable<RolePermissionRow>>> GetForRole(int roleId)
    {
        var navPages = await _db.NavPages.Include(p => p.Module).OrderBy(p => p.ModuleId).ThenBy(p => p.DisplayOrder).AsNoTracking().ToListAsync();
        var perms = await _db.RolePermissions.Where(rp => rp.RoleId == roleId).AsNoTracking().ToListAsync();

        var rows = navPages.Select(p =>
        {
            var rp = perms.FirstOrDefault(x => x.NavPageId == p.NavPageId);
            return new RolePermissionRow(p.NavPageId, p.PageName, p.Module.ModuleName,
                rp?.CanCreate ?? false, rp?.CanRead ?? false, rp?.CanUpdate ?? false, rp?.CanDelete ?? false);
        });

        return Ok(rows);
    }

    // Upserts the permission row for role x page. Only editable by roles that
    // themselves have canUpdate on this page (i.e. typically Admin only) —
    // enforced by the [RequiresPermission] attribute below.
    [HttpPut("role/{roleId}/page/{navPageId}"), RequiresPermission(NavPageIds.RolesPermissions, Permission.Update)]
    public async Task<IActionResult> SetForRolePage(int roleId, int navPageId, UpdateRolePermissionRequest request)
    {
        var rp = await _db.RolePermissions.FirstOrDefaultAsync(x => x.RoleId == roleId && x.NavPageId == navPageId);
        if (rp is null)
        {
            rp = new RolePermission { RoleId = roleId, NavPageId = navPageId };
            _db.RolePermissions.Add(rp);
        }

        rp.CanCreate = request.CanCreate;
        rp.CanRead = request.CanRead;
        rp.CanUpdate = request.CanUpdate;
        rp.CanDelete = request.CanDelete;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Convenience "quick set" endpoint used by the All/None buttons per row.
    [HttpPut("role/{roleId}/page/{navPageId}/quick-set"), RequiresPermission(NavPageIds.RolesPermissions, Permission.Update)]
    public async Task<IActionResult> QuickSet(int roleId, int navPageId, [FromQuery] bool value)
        => await SetForRolePage(roleId, navPageId, new UpdateRolePermissionRequest(value, value, value, value));
}
