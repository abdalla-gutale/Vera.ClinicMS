using Microsoft.AspNetCore.Mvc;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Controllers;

[Route("api/product-categories")]
public class ProductCategoriesController : CrudControllerBase<ProductCategory, int>
{
    public ProductCategoriesController(VeraDbContext db) : base(db) { }
    protected override int GetId(ProductCategory e) => e.CategoryId;

    [HttpGet, RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override Task<ActionResult<IEnumerable<ProductCategory>>> GetAll() => base.GetAll();

    [HttpGet("{id}"), RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override Task<ActionResult<ProductCategory>> GetById(int id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.Products, Permission.Create)]
    public override Task<ActionResult<ProductCategory>> Create(ProductCategory entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Products, Permission.Update)]
    public override Task<IActionResult> Update(int id, ProductCategory entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.Products, Permission.Delete)]
    public override Task<IActionResult> Delete(int id) => base.Delete(id);
}

[Route("api/products")]
public class ProductsController : CrudControllerBase<Product, long>
{
    public ProductsController(VeraDbContext db) : base(db) { }
    protected override long GetId(Product e) => e.ProductId;

    [HttpGet, RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override Task<ActionResult<IEnumerable<Product>>> GetAll() => base.GetAll();

    [HttpGet("{id}"), RequiresPermission(NavPageIds.Products, Permission.Read)]
    public override Task<ActionResult<Product>> GetById(long id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.Products, Permission.Create)]
    public override Task<ActionResult<Product>> Create(Product entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Products, Permission.Update)]
    public override Task<IActionResult> Update(long id, Product entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.Products, Permission.Delete)]
    public override Task<IActionResult> Delete(long id) => base.Delete(id);
}

[Route("api/suppliers")]
public class SuppliersController : CrudControllerBase<Supplier, long>
{
    public SuppliersController(VeraDbContext db) : base(db) { }
    protected override long GetId(Supplier e) => e.SupplierId;

    [HttpGet, RequiresPermission(NavPageIds.Suppliers, Permission.Read)]
    public override Task<ActionResult<IEnumerable<Supplier>>> GetAll() => base.GetAll();

    [HttpGet("{id}"), RequiresPermission(NavPageIds.Suppliers, Permission.Read)]
    public override Task<ActionResult<Supplier>> GetById(long id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.Suppliers, Permission.Create)]
    public override Task<ActionResult<Supplier>> Create(Supplier entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Suppliers, Permission.Update)]
    public override Task<IActionResult> Update(long id, Supplier entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.Suppliers, Permission.Delete)]
    public override Task<IActionResult> Delete(long id) => base.Delete(id);
}

[Route("api/services")]
public class ServicesController : CrudControllerBase<Service, long>
{
    public ServicesController(VeraDbContext db) : base(db) { }
    protected override long GetId(Service e) => e.ServiceId;

    [HttpGet, RequiresPermission(NavPageIds.Services, Permission.Read)]
    public override Task<ActionResult<IEnumerable<Service>>> GetAll() => base.GetAll();

    [HttpGet("{id}"), RequiresPermission(NavPageIds.Services, Permission.Read)]
    public override Task<ActionResult<Service>> GetById(long id) => base.GetById(id);

    [HttpPost, RequiresPermission(NavPageIds.Services, Permission.Create)]
    public override Task<ActionResult<Service>> Create(Service entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Services, Permission.Update)]
    public override Task<IActionResult> Update(long id, Service entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.Services, Permission.Delete)]
    public override Task<IActionResult> Delete(long id) => base.Delete(id);
}

[Route("api/expense-categories")]
public class ExpenseCategoriesController : CrudControllerBase<ExpenseCategory, int>
{
    public ExpenseCategoriesController(VeraDbContext db) : base(db) { }
    protected override int GetId(ExpenseCategory e) => e.CategoryId;

    [HttpGet, RequiresPermission(NavPageIds.ExpenseCategories, Permission.Read)]
    public override Task<ActionResult<IEnumerable<ExpenseCategory>>> GetAll() => base.GetAll();

    [HttpPost, RequiresPermission(NavPageIds.ExpenseCategories, Permission.Create)]
    public override Task<ActionResult<ExpenseCategory>> Create(ExpenseCategory entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.ExpenseCategories, Permission.Update)]
    public override Task<IActionResult> Update(int id, ExpenseCategory entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.ExpenseCategories, Permission.Delete)]
    public override Task<IActionResult> Delete(int id) => base.Delete(id);
}

[Route("api/setup-expenses")]
public class SetupExpensesController : CrudControllerBase<SetupExpense, long>
{
    public SetupExpensesController(VeraDbContext db) : base(db) { }
    protected override long GetId(SetupExpense e) => e.SetupExpenseId;

    [HttpGet, RequiresPermission(NavPageIds.SetupExpenses, Permission.Read)]
    public override Task<ActionResult<IEnumerable<SetupExpense>>> GetAll() => base.GetAll();

    [HttpPost, RequiresPermission(NavPageIds.SetupExpenses, Permission.Create)]
    public override Task<ActionResult<SetupExpense>> Create(SetupExpense entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.SetupExpenses, Permission.Update)]
    public override Task<IActionResult> Update(long id, SetupExpense entity) => base.Update(id, entity);

    [HttpDelete("{id}"), RequiresPermission(NavPageIds.SetupExpenses, Permission.Delete)]
    public override Task<IActionResult> Delete(long id) => base.Delete(id);
}

[Route("api/discount-configurations")]
public class DiscountConfigurationsController : CrudControllerBase<DiscountConfiguration, int>
{
    public DiscountConfigurationsController(VeraDbContext db) : base(db) { }
    protected override int GetId(DiscountConfiguration e) => e.DiscountId;

    [HttpGet, RequiresPermission(NavPageIds.SystemConfiguration, Permission.Read)]
    public override Task<ActionResult<IEnumerable<DiscountConfiguration>>> GetAll() => base.GetAll();

    [HttpPost, RequiresPermission(NavPageIds.SystemConfiguration, Permission.Create)]
    public override Task<ActionResult<DiscountConfiguration>> Create(DiscountConfiguration entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.SystemConfiguration, Permission.Update)]
    public override Task<IActionResult> Update(int id, DiscountConfiguration entity) => base.Update(id, entity);
}

[Route("api/account-setups")]
public class AccountSetupsController : CrudControllerBase<AccountSetup, int>
{
    public AccountSetupsController(VeraDbContext db) : base(db) { }
    protected override int GetId(AccountSetup e) => e.AccountId;

    [HttpGet, RequiresPermission(NavPageIds.SystemConfiguration, Permission.Read)]
    public override Task<ActionResult<IEnumerable<AccountSetup>>> GetAll() => base.GetAll();

    [HttpPost, RequiresPermission(NavPageIds.SystemConfiguration, Permission.Create)]
    public override Task<ActionResult<AccountSetup>> Create(AccountSetup entity) => base.Create(entity);

    [HttpPut("{id}"), RequiresPermission(NavPageIds.SystemConfiguration, Permission.Update)]
    public override Task<IActionResult> Update(int id, AccountSetup entity) => base.Update(id, entity);
}

[Route("api/modules")]
public class ModulesController : CrudControllerBase<Module, int>
{
    public ModulesController(VeraDbContext db) : base(db) { }
    protected override int GetId(Module e) => e.ModuleId;

    [HttpGet, RequiresPermission(NavPageIds.Modules, Permission.Read)]
    public override Task<ActionResult<IEnumerable<Module>>> GetAll() => base.GetAll();

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Modules, Permission.Update)]
    public override Task<IActionResult> Update(int id, Module entity) => base.Update(id, entity);
}

[Route("api/nav-pages")]
public class NavPagesController : CrudControllerBase<NavPage, int>
{
    public NavPagesController(VeraDbContext db) : base(db) { }
    protected override int GetId(NavPage e) => e.NavPageId;

    [HttpGet, RequiresPermission(NavPageIds.NavPages, Permission.Read)]
    public override Task<ActionResult<IEnumerable<NavPage>>> GetAll() => base.GetAll();

    [HttpPut("{id}"), RequiresPermission(NavPageIds.NavPages, Permission.Update)]
    public override Task<IActionResult> Update(int id, NavPage entity) => base.Update(id, entity);
}
