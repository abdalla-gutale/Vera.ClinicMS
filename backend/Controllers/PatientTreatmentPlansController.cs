using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.DTOs.Patients;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/patient-treatment-plans")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class PatientTreatmentPlansController : ControllerBase
{
    private readonly VeraDbContext _db;
    public PatientTreatmentPlansController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.ActivePatientPlans, Permission.Read)]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var plans = await _db.PatientTreatmentPlans
            .Include(p => p.Patient).Include(p => p.Plan)
            .Include(p => p.Cycles).ThenInclude(c => c.Session)
            .AsNoTracking().ToListAsync();

        return Ok(plans.Select(p => new
        {
            p.PatientPlanId,
            p.PatientId,
            PatientName = p.Patient.FullName,
            p.PlanId,
            PlanName = p.Plan.PlanName,
            PlanType = p.Plan.PlanType,
            p.AgreedPrice,
            p.BalanceRemaining,
            p.Status,
            p.StartDate,
            TotalCycles = p.Cycles.Count,
            CompletedCycles = p.Cycles.Count(c => c.Status == CycleStatus.Completed),
        }));
    }

    // Assigns a plan template to a registered patient. Enforces "one active
    // plan per patient" both here (clear error message) and via the database's
    // filtered unique index (belt-and-suspenders against race conditions).
    // Generates one PlanCycle per session, scheduled using the plan's Frequency.
    [HttpPost("assign"), RequiresPermission(NavPageIds.ActivePatientPlans, Permission.Create)]
    public async Task<ActionResult<PatientTreatmentPlan>> Assign(AssignPlanRequest request)
    {
        var alreadyActive = await _db.PatientTreatmentPlans
            .AnyAsync(p => p.PatientId == request.PatientId && p.Status == PatientPlanStatus.Active);
        if (alreadyActive)
            return Conflict(new { message = "This patient already has an ACTIVE treatment plan. Complete or cancel it first." });

        var plan = await _db.TreatmentPlans.Include(p => p.Sessions).FirstOrDefaultAsync(p => p.PlanId == request.PlanId);
        if (plan is null) return NotFound(new { message = "Treatment plan template not found." });

        var patientPlan = new PatientTreatmentPlan
        {
            PatientId = request.PatientId,
            PlanId = request.PlanId,
            AgreedPrice = plan.TotalPrice,
            BalanceRemaining = plan.TotalPrice,
            Status = PatientPlanStatus.Active,
            StartDate = request.StartDate,
        };

        foreach (var session in plan.Sessions.OrderBy(s => s.SessionNumber))
        {
            patientPlan.Cycles.Add(new PlanCycle
            {
                SessionId = session.SessionId,
                CycleNumber = session.SessionNumber,
                ScheduledDate = ComputeScheduledDate(request.StartDate, plan.Frequency, session.SessionNumber),
                Status = CycleStatus.Pending,
            });
        }

        _db.PatientTreatmentPlans.Add(patientPlan);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            // Race condition: two requests assigned a plan to the same patient
            // at nearly the same time. The filtered unique index caught it.
            return Conflict(new { message = "This patient already has an ACTIVE treatment plan." });
        }

        return CreatedAtAction(nameof(GetAll), patientPlan);
    }

    private static DateTime ComputeScheduledDate(DateTime start, string frequency, int sessionNumber)
    {
        var idx = sessionNumber - 1;
        return frequency switch
        {
            Frequency.Daily => start.AddDays(idx),
            Frequency.Weekly => start.AddDays(idx * 7),
            _ => start.AddMonths(idx), // MONTHLY
        };
    }

    // SQL Server unique-index violation error numbers: 2601 (duplicate key row)
    // and 2627 (violation of unique constraint).
    private static bool IsUniqueConstraintViolation(DbUpdateException ex) =>
        ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627);
}
