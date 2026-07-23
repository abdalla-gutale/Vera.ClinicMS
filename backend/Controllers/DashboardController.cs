using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

// Single aggregation endpoint for the post-login landing page (the page the
// frontend routes to right after the verify-code step succeeds).
[Route("api/dashboard")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class DashboardController : ControllerBase
{
    private readonly VeraDbContext _db;
    public DashboardController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.Dashboard, Permission.Read)]
    public async Task<ActionResult<object>> Get()
    {
        var totalRevenue = await _db.Invoices.SumAsync(i => i.GrandTotal);
        var walkInRevenue = await _db.Invoices.Where(i => i.Channel == InvoiceChannel.WalkIn).SumAsync(i => i.GrandTotal);
        var cycleRevenue = await _db.Invoices.Where(i => i.Channel == InvoiceChannel.Cycle).SumAsync(i => i.GrandTotal);
        var activePlans = await _db.PatientTreatmentPlans.CountAsync(p => p.Status == PatientPlanStatus.Active);

        var lowStock = await _db.ProductSkus.Where(s => s.CurrentStock <= s.ReorderLevel).AsNoTracking()
            .Select(s => new { s.SkuId, s.SkuCode, s.CurrentStock, s.ReorderLevel }).ToListAsync();

        var pos = await _db.PurchaseOrders.Where(p => p.OrderStatus != PurchaseOrderStatus.Draft && p.OrderStatus != PurchaseOrderStatus.Cancelled).ToListAsync();
        var supplierPayments = await _db.SupplierPayments.ToListAsync();
        var supplierBalance = pos.Sum(p => p.TotalAmount) - supplierPayments.Sum(p => p.AmountPaid);
        var patientBalance = await _db.PatientTreatmentPlans.SumAsync(p => p.BalanceRemaining);

        var upcomingCycles = await _db.PlanCycles
            .Where(c => c.Status == CycleStatus.Pending)
            .Include(c => c.PatientPlan).ThenInclude(pp => pp.Patient)
            .Include(c => c.Session)
            .OrderBy(c => c.ScheduledDate)
            .Take(4)
            .AsNoTracking()
            .Select(c => new
            {
                c.CycleId,
                c.CycleNumber,
                c.ScheduledDate,
                PatientName = c.PatientPlan.Patient.FullName,
                SessionTitle = c.Session.SessionTitle,
                IsOverdue = c.ScheduledDate < DateTime.UtcNow,
            })
            .ToListAsync();

        return Ok(new
        {
            TotalRevenue = totalRevenue,
            WalkInRevenue = walkInRevenue,
            CycleRevenue = cycleRevenue,
            ActivePatientPlans = activePlans,
            LowStockSkus = lowStock,
            SupplierLiabilities = supplierBalance,
            PatientBalancesOutstanding = patientBalance,
            UpcomingCycles = upcomingCycles,
        });
    }
}
