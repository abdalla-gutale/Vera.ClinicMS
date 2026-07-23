using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Patients;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/treatment-plans")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class TreatmentPlansController : ControllerBase
{
    private readonly VeraDbContext _db;
    public TreatmentPlansController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.TreatmentPlanMaster, Permission.Read)]
    public async Task<ActionResult<IEnumerable<TreatmentPlan>>> GetAll()
        => Ok(await _db.TreatmentPlans
            .Include(p => p.Sessions).ThenInclude(s => s.AssignedServices).ThenInclude(x => x.Service)
            .Include(p => p.Sessions).ThenInclude(s => s.AssignedProducts).ThenInclude(x => x.Sku)
            .AsNoTracking().ToListAsync());

    // Builds a plan template with its sessions and per-session service/product
    // assignments in one call. For FIXED_PACKAGE plans, the frontend replicates
    // Session 1's items to every session before calling this — the API accepts
    // whatever session list it's given rather than re-deriving the rule, so the
    // same endpoint works for both plan types.
    [HttpPost, RequiresPermission(NavPageIds.TreatmentPlanMaster, Permission.Create)]
    public async Task<ActionResult<TreatmentPlan>> Create(CreateTreatmentPlanRequest request)
    {
        var serviceIds = request.Sessions.SelectMany(s => s.ServiceIds).Distinct().ToList();
        var services = await _db.Services.Where(s => serviceIds.Contains(s.ServiceId)).ToListAsync();
        var skuIds = request.Sessions.SelectMany(s => s.Products.Select(p => p.SkuId)).Distinct().ToList();
        var skus = await _db.ProductSkus.Where(s => skuIds.Contains(s.SkuId)).ToListAsync();

        decimal Total(PlanSessionRequest s) =>
            s.ServiceIds.Sum(id => services.First(x => x.ServiceId == id).BasePrice) +
            s.Products.Sum(p => skus.First(x => x.SkuId == p.SkuId).UnitPrice * p.Quantity);

        var plan = new TreatmentPlan
        {
            PlanName = request.PlanName,
            PlanType = request.PlanType,
            NumberOfSessions = request.NumberOfSessions,
            Frequency = request.Frequency,
            TotalPrice = request.Sessions.Sum(Total),
            Sessions = request.Sessions.Select(s => new TreatmentPlanSession
            {
                SessionNumber = s.SessionNumber,
                SessionTitle = s.SessionTitle,
                AssignedServices = s.ServiceIds.Select(id => new TreatmentPlanSessionService { ServiceId = id }).ToList(),
                AssignedProducts = s.Products.Select(p => new TreatmentPlanSessionProduct { SkuId = p.SkuId, Quantity = p.Quantity }).ToList(),
            }).ToList(),
        };

        _db.TreatmentPlans.Add(plan);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), plan);
    }
}
