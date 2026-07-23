using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/expense-budget-estimates")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ExpenseBudgetEstimatesController : ControllerBase
{
    private readonly VeraDbContext _db;
    public ExpenseBudgetEstimatesController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.ExpenseBudgetEstimates, Permission.Read)]
    public async Task<ActionResult<IEnumerable<ExpenseBudgetEstimate>>> GetAll()
        => Ok(await _db.ExpenseBudgetEstimates.Include(b => b.Category).AsNoTracking().ToListAsync());

    // Upserts the budget for a category/month/year — matches the frontend's
    // "Set Budget" form, which replaces any existing estimate for that period.
    [HttpPost, RequiresPermission(NavPageIds.ExpenseBudgetEstimates, Permission.Create)]
    public async Task<ActionResult<ExpenseBudgetEstimate>> Upsert(ExpenseBudgetEstimate request)
    {
        var existing = await _db.ExpenseBudgetEstimates.FirstOrDefaultAsync(b =>
            b.CategoryId == request.CategoryId && b.Month == request.Month && b.Year == request.Year);

        if (existing is not null)
        {
            existing.BudgetedAmount = request.BudgetedAmount;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        _db.ExpenseBudgetEstimates.Add(request);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), request);
    }

    // Budget vs Actual per category for a given month/year, with variance —
    // backs both the Expense Budget page and the Financial Reports summary.
    [HttpGet("variance"), RequiresPermission(NavPageIds.ExpenseBudgetEstimates, Permission.Read)]
    public async Task<ActionResult<object>> GetVariance([FromQuery] int month, [FromQuery] int year)
    {
        var categories = await _db.ExpenseCategories.AsNoTracking().ToListAsync();
        var budgets = await _db.ExpenseBudgetEstimates.Where(b => b.Month == month && b.Year == year).AsNoTracking().ToListAsync();
        var actuals = await _db.ExpenseEntries
            .Where(e => e.ExpenseDate.Month == month && e.ExpenseDate.Year == year)
            .AsNoTracking().ToListAsync();

        var rows = categories.Select(c =>
        {
            var budgeted = budgets.FirstOrDefault(b => b.CategoryId == c.CategoryId)?.BudgetedAmount ?? 0;
            var actual = actuals.Where(a => a.CategoryId == c.CategoryId).Sum(a => a.Amount);
            return new
            {
                c.CategoryId,
                c.CategoryName,
                Budgeted = budgeted,
                Actual = actual,
                Variance = budgeted - actual,
                IsOverBudget = actual > budgeted,
            };
        });

        return Ok(rows);
    }
}
