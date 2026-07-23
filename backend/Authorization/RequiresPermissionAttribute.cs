using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;
using VeraApi.Data;

namespace VeraApi.Authorization;

public enum Permission { Create, Read, Update, Delete }

// NavPageId constants — must stay in lockstep with the frontend's PAGE_META /
// navPages seed data so [RequiresPermission] checks line up with what the
// Roles & Permissions matrix in the UI actually controls.
public static class NavPageIds
{
    public const int Dashboard = 24;
    public const int SystemConfiguration = 1;
    public const int Modules = 2;
    public const int NavPages = 3;
    public const int RolesPermissions = 4;
    public const int Users = 5;
    public const int Products = 6;
    public const int Suppliers = 7;
    public const int PurchaseOrders = 8;
    public const int PurchaseOrderReturns = 9;
    public const int SupplierPayments = 10;
    public const int StockMovements = 11;
    public const int Services = 12;
    public const int PatientDirectory = 13;
    public const int TreatmentPlanMaster = 14;
    public const int ActivePatientPlans = 15;
    public const int BillingInvoices = 16;
    public const int ExpenseCategories = 17;
    public const int SetupExpenses = 18;
    public const int ExpenseBudgetEstimates = 19;
    public const int ExpenseEntries = 20;
    public const int ReportsFinancial = 21;
    public const int ReportsClinical = 22;
    public const int ReportsInventory = 23;
}

// Usage: [RequiresPermission(NavPageIds.PurchaseOrders, Permission.Create)]
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class RequiresPermissionAttribute : Attribute, IAsyncActionFilter
{
    private readonly int _navPageId;
    private readonly Permission _permission;

    public RequiresPermissionAttribute(int navPageId, Permission permission)
    {
        _navPageId = navPageId;
        _permission = permission;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var roleIdClaim = context.HttpContext.User.FindFirst("roleId")?.Value;
        if (roleIdClaim is null || !int.TryParse(roleIdClaim, out var roleId))
        {
            context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedResult();
            return;
        }

        var db = context.HttpContext.RequestServices.GetRequiredService<VeraDbContext>();
        var rp = db.RolePermissions.FirstOrDefault(x => x.RoleId == roleId && x.NavPageId == _navPageId);

        var allowed = rp is not null && _permission switch
        {
            Permission.Create => rp.CanCreate,
            Permission.Read => rp.CanRead,
            Permission.Update => rp.CanUpdate,
            Permission.Delete => rp.CanDelete,
            _ => false,
        };

        if (!allowed)
        {
            context.Result = new Microsoft.AspNetCore.Mvc.ObjectResult(new { message = "You don't have permission to perform this action." })
            {
                StatusCode = 403,
            };
            return;
        }

        await next();
    }
}
