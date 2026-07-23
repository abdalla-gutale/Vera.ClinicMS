using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

public record CreateExpenseEntryRequest(int CategoryId, int AccountId, string Title, decimal Amount, string? VendorName, string? Notes);

[Route("api/expense-entries")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ExpenseEntriesController : ControllerBase
{
    private readonly VeraDbContext _db;
    public ExpenseEntriesController(VeraDbContext db) => _db = db;

    [HttpGet, RequiresPermission(NavPageIds.ExpenseEntries, Permission.Read)]
    public async Task<ActionResult<IEnumerable<ExpenseEntry>>> GetAll()
        => Ok(await _db.ExpenseEntries.Include(e => e.Category).Include(e => e.Account)
            .OrderByDescending(e => e.ExpenseDate).AsNoTracking().ToListAsync());

    [HttpPost, RequiresPermission(NavPageIds.ExpenseEntries, Permission.Create)]
    public async Task<ActionResult<ExpenseEntry>> Create(CreateExpenseEntryRequest request)
    {
        var account = await _db.AccountSetups.FindAsync(request.AccountId);
        if (account is null || !account.IsActive) return BadRequest(new { message = "Account not found or inactive." });
        if (request.Amount <= 0) return BadRequest(new { message = "Amount must be positive." });

        account.CurrentBalance -= request.Amount;

        var entry = new ExpenseEntry
        {
            CategoryId = request.CategoryId,
            AccountId = request.AccountId,
            Title = request.Title,
            Amount = request.Amount,
            ExpenseDate = DateTime.UtcNow,
            VendorName = request.VendorName,
            Notes = request.Notes,
            LoggedByUserId = long.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0"),
        };
        _db.ExpenseEntries.Add(entry);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), entry);
    }
}
