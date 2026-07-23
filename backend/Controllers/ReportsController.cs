using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/reports")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ReportsController : ControllerBase
{
    private readonly VeraDbContext _db;
    public ReportsController(VeraDbContext db) => _db = db;

    // P&L summary, per-account cashflow, services-vs-products revenue split,
    // and outstanding balances (supplier liabilities + patient plan balances).
    [HttpGet("financial"), RequiresPermission(NavPageIds.ReportsFinancial, Permission.Read)]
    public async Task<ActionResult<object>> Financial()
    {
        var totalRevenue = await _db.Invoices.SumAsync(i => i.GrandTotal);
        var totalExpense = await _db.ExpenseEntries.SumAsync(e => e.Amount);
        var revenueByServices = await _db.InvoiceServices.SumAsync(x => x.UnitPrice);
        var revenueByProducts = await _db.InvoiceProducts.SumAsync(x => x.UnitPrice * x.Quantity);

        var accounts = await _db.AccountSetups.AsNoTracking()
            .Select(a => new { a.AccountId, a.AccountName, a.CurrentBalance }).ToListAsync();

        var pos = await _db.PurchaseOrders.Where(p => p.OrderStatus != PurchaseOrderStatus.Draft && p.OrderStatus != PurchaseOrderStatus.Cancelled).ToListAsync();
        var payments = await _db.SupplierPayments.ToListAsync();
        var supplierOutstanding = pos.Sum(p => p.TotalAmount) - payments.Sum(p => p.AmountPaid);
        var patientOutstanding = await _db.PatientTreatmentPlans.SumAsync(p => p.BalanceRemaining);

        return Ok(new
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpense,
            NetProfit = totalRevenue - totalExpense,
            RevenueByServices = revenueByServices,
            RevenueByProducts = revenueByProducts,
            CashflowByAccount = accounts,
            OutstandingSupplierLiabilities = supplierOutstanding,
            OutstandingPatientBalances = patientOutstanding,
        });
    }

    // Cycle completion rate, patient attendance this month, walk-in -> registered conversion.
    [HttpGet("clinical"), RequiresPermission(NavPageIds.ReportsClinical, Permission.Read)]
    public async Task<ActionResult<object>> Clinical()
    {
        var cycles = await _db.PlanCycles.AsNoTracking().ToListAsync();
        var completed = cycles.Count(c => c.Status == CycleStatus.Completed);
        var completionRate = cycles.Count == 0 ? 0 : Math.Round(100.0 * completed / cycles.Count, 1);

        var now = DateTime.UtcNow;
        var attendanceThisMonth = cycles.Count(c => c.Status == CycleStatus.Completed && c.ExecutionDate?.Month == now.Month && c.ExecutionDate?.Year == now.Year);

        var walkIns = await _db.Patients.CountAsync(p => p.PatientType == PatientType.WalkIn);
        var registered = await _db.Patients.CountAsync(p => p.PatientType == PatientType.Registered);
        var totalPatients = walkIns + registered;
        var conversionRate = totalPatients == 0 ? 0 : Math.Round(100.0 * registered / totalPatients, 1);

        return Ok(new
        {
            CycleCompletionRatePct = completionRate,
            CompletedCycles = completed,
            TotalCycles = cycles.Count,
            AttendanceThisMonth = attendanceThisMonth,
            WalkInCount = walkIns,
            RegisteredCount = registered,
            WalkInToRegisteredConversionPct = conversionRate,
        });
    }

    // Movement summary by type, low-stock alert list, product usage trend.
    [HttpGet("inventory-audit"), RequiresPermission(NavPageIds.ReportsInventory, Permission.Read)]
    public async Task<ActionResult<object>> InventoryAudit()
    {
        var movements = await _db.StockMovementLogs.AsNoTracking().ToListAsync();
        var byType = new[] { MovementType.PoReceive, MovementType.DirectSale, MovementType.Adjustment, MovementType.Return }
            .Select(t => new
            {
                MovementType = t,
                Count = movements.Count(m => m.MovementType == t),
                TotalUnits = movements.Where(m => m.MovementType == t).Sum(m => Math.Abs(m.QuantityChanged)),
            });

        var lowStock = await _db.ProductSkus.Where(s => s.CurrentStock <= s.ReorderLevel).AsNoTracking()
            .Select(s => new { s.SkuId, s.SkuCode, s.CurrentStock, s.ReorderLevel }).ToListAsync();

        var usageBySku = await _db.ProductSkus.AsNoTracking().ToListAsync();
        var usage = usageBySku
            .Select(s => new { s.SkuId, s.SkuCode, Used = movements.Where(m => m.SkuId == s.SkuId && m.QuantityChanged < 0).Sum(m => -m.QuantityChanged) })
            .OrderByDescending(x => x.Used)
            .ToList();

        return Ok(new { ByType = byType, LowStock = lowStock, UsageTrend = usage });
    }
}
