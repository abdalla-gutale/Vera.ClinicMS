using Microsoft.AspNetCore.Mvc;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/plan-cycles")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PlanCyclesController : ControllerBase
{
    private readonly VeraDbContext _db;
    public PlanCyclesController(VeraDbContext db) => _db = db;

    // Marks a cycle attended. This does NOT create an invoice — billing is a
    // deliberate separate step (see BillingController.CycleCheckout), matching
    // the frontend's split between "Active Patient Plans" and "Billing & Invoices".
    [HttpPost("{id}/complete"), RequiresPermission(NavPageIds.ActivePatientPlans, Permission.Update)]
    public async Task<IActionResult> Complete(long id)
    {
        var cycle = await _db.PlanCycles.FindAsync(id);
        if (cycle is null) return NotFound();
        if (cycle.Status != CycleStatus.Pending) return BadRequest(new { message = "Only PENDING cycles can be marked complete." });

        cycle.Status = CycleStatus.Completed;
        cycle.ExecutionDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
