using Microsoft.EntityFrameworkCore;
using VeraApi.Models;

namespace VeraApi.Data;

public class VeraDbContext : DbContext
{
    public VeraDbContext(DbContextOptions<VeraDbContext> options) : base(options) { }

    // Configuration & Access Control
    public DbSet<ClinicSetting> ClinicSettings => Set<ClinicSetting>();
    public DbSet<AccountSetup> AccountSetups => Set<AccountSetup>();
    public DbSet<DiscountConfiguration> DiscountConfigurations => Set<DiscountConfiguration>();
    public DbSet<SmsGateway> SmsGateways => Set<SmsGateway>();
    public DbSet<SmsTemplate> SmsTemplates => Set<SmsTemplate>();
    public DbSet<SmsTemplateGateway> SmsTemplateGateways => Set<SmsTemplateGateway>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<NavPage> NavPages => Set<NavPage>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<ReportPermission> ReportPermissions => Set<ReportPermission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<VerificationCode> VerificationCodes => Set<VerificationCode>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Inventory & Procurement
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSku> ProductSkus => Set<ProductSku>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<StockMovementLog> StockMovementLogs => Set<StockMovementLog>();
    public DbSet<PurchaseReturn> PurchaseReturns => Set<PurchaseReturn>();
    public DbSet<SupplierPayment> SupplierPayments => Set<SupplierPayment>();
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();

    // Services
    public DbSet<Service> Services => Set<Service>();

    // Patients, Plans & Billing
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<TreatmentPlan> TreatmentPlans => Set<TreatmentPlan>();
    public DbSet<TreatmentPlanSession> TreatmentPlanSessions => Set<TreatmentPlanSession>();
    public DbSet<TreatmentPlanSessionService> TreatmentPlanSessionServices => Set<TreatmentPlanSessionService>();
    public DbSet<TreatmentPlanSessionProduct> TreatmentPlanSessionProducts => Set<TreatmentPlanSessionProduct>();
    public DbSet<PatientTreatmentPlan> PatientTreatmentPlans => Set<PatientTreatmentPlan>();
    public DbSet<PlanCycle> PlanCycles => Set<PlanCycle>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceService> InvoiceServices => Set<InvoiceService>();
    public DbSet<InvoiceProduct> InvoiceProducts => Set<InvoiceProduct>();
    public DbSet<PatientPayment> PatientPayments => Set<PatientPayment>();

    // Expense & Budgeting
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<SetupExpense> SetupExpenses => Set<SetupExpense>();
    public DbSet<ExpenseBudgetEstimate> ExpenseBudgetEstimates => Set<ExpenseBudgetEstimate>();
    public DbSet<ExpenseEntry> ExpenseEntries => Set<ExpenseEntry>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ---- Primary Key Definitions ----
        // Configuration & Security
        b.Entity<ClinicSetting>().HasKey(c => c.SettingId);
        b.Entity<AccountSetup>().HasKey(a => a.AccountId);
        b.Entity<DiscountConfiguration>().HasKey(d => d.DiscountId);
        b.Entity<SmsGateway>().HasKey(s => s.GatewayId);
        b.Entity<SmsTemplate>().HasKey(s => s.TemplateId);
        b.Entity<Module>().HasKey(m => m.ModuleId);
        b.Entity<NavPage>().HasKey(n => n.NavPageId);
        b.Entity<Role>().HasKey(r => r.RoleId);
        b.Entity<RolePermission>().HasKey(r => r.RolePermissionId);
        b.Entity<ReportPermission>().HasKey(r => r.ReportPermissionId);
        b.Entity<User>().HasKey(u => u.Id);
        b.Entity<VerificationCode>().HasKey(v => v.VerificationCodeId);
        b.Entity<RefreshToken>().HasKey(r => r.RefreshTokenId);

        // Expense & Budgeting
        b.Entity<ExpenseCategory>().HasKey(e => e.CategoryId);
        b.Entity<SetupExpense>().HasKey(e => e.SetupExpenseId);
        b.Entity<ExpenseBudgetEstimate>().HasKey(e => e.EstimateId);
        b.Entity<ExpenseEntry>().HasKey(e => e.ExpenseEntryId);

        // Services & Patient Billing
        b.Entity<Service>().HasKey(s => s.ServiceId);
        b.Entity<Patient>().HasKey(p => p.PatientId);
        b.Entity<TreatmentPlan>().HasKey(t => t.PlanId);
        b.Entity<TreatmentPlanSession>().HasKey(t => t.SessionId);
        b.Entity<TreatmentPlanSessionService>().HasKey(t => t.SessionServiceId);
        b.Entity<TreatmentPlanSessionProduct>().HasKey(t => t.SessionProductId);
        b.Entity<PatientTreatmentPlan>().HasKey(p => p.PatientPlanId);
        b.Entity<PlanCycle>().HasKey(p => p.CycleId);
        b.Entity<Invoice>().HasKey(i => i.InvoiceId);
        b.Entity<InvoiceService>().HasKey(i => i.InvoiceServiceId);
        b.Entity<InvoiceProduct>().HasKey(i => i.InvoiceProductId);
        b.Entity<PatientPayment>().HasKey(p => p.PaymentId);

        // Inventory & Procurement
        b.Entity<ProductCategory>().HasKey(p => p.CategoryId);
        b.Entity<Product>().HasKey(p => p.ProductId);
        b.Entity<ProductSku>().HasKey(p => p.SkuId);
        b.Entity<Supplier>().HasKey(s => s.SupplierId);
        b.Entity<PurchaseOrder>().HasKey(p => p.PurchaseOrderId);
        b.Entity<PurchaseOrderItem>().HasKey(p => p.PoItemId);
        b.Entity<StockMovementLog>().HasKey(s => s.MovementId);
        b.Entity<PurchaseReturn>().HasKey(p => p.ReturnId);
        b.Entity<SupplierPayment>().HasKey(s => s.PaymentId);
        b.Entity<StockAdjustment>().HasKey(s => s.AdjustmentId);

        // ---- Decimal Precision Settings ----
        foreach (var property in b.Model.GetEntityTypes()
                     .SelectMany(t => t.GetProperties())
                     .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // ---- Unique Constraints ----
        b.Entity<User>().HasIndex(u => u.Username).IsUnique();
        b.Entity<User>().HasIndex(u => u.Email).IsUnique();
        b.Entity<ProductSku>().HasIndex(s => s.SkuCode).IsUnique();
        b.Entity<PurchaseOrder>().HasIndex(p => p.PoNumber).IsUnique();
        b.Entity<Invoice>().HasIndex(i => i.InvoiceNumber).IsUnique();
        b.Entity<DiscountConfiguration>().HasIndex(d => d.DiscountCode).IsUnique();
        b.Entity<RolePermission>().HasIndex(rp => new { rp.RoleId, rp.NavPageId }).IsUnique();
        b.Entity<AccountSetup>().HasIndex(a => a.AccountName);

        // A patient may hold at most one ACTIVE treatment plan at a time.
        b.Entity<PatientTreatmentPlan>()
            .HasIndex(p => p.PatientId)
            .IsUnique()
            .HasFilter("[Status] = 'ACTIVE'")
            .HasDatabaseName("IX_PatientTreatmentPlans_OneActivePlanPerPatient");

        // ---- Junction Tables (Many-to-Many) ----
        b.Entity<SmsTemplateGateway>().HasKey(x => new { x.TemplateId, x.GatewayId });
        b.Entity<SmsTemplateGateway>()
            .HasOne(x => x.Template).WithMany(t => t.GatewayLinks).HasForeignKey(x => x.TemplateId);
        b.Entity<SmsTemplateGateway>()
            .HasOne(x => x.Gateway).WithMany(g => g.TemplateLinks).HasForeignKey(x => x.GatewayId);

        // ---- Foreign Key & Cascade Delete Rules ----

        // 1. PlanCycle Restrictions
        b.Entity<PlanCycle>()
            .HasOne(pc => pc.Session)
            .WithMany()
            .HasForeignKey(pc => pc.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<PlanCycle>()
            .HasOne(pc => pc.PatientPlan)
            .WithMany(p => p.Cycles)
            .HasForeignKey(pc => pc.PatientPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // 2. Invoice Relationship Restrictions (Fixes Error 1785)
        b.Entity<Invoice>()
            .HasOne(i => i.Cycle)
            .WithOne(c => c.Invoice)
            .HasForeignKey<Invoice>(i => i.CycleId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Invoice>()
            .HasOne(i => i.PatientPlan)
            .WithMany()
            .HasForeignKey(i => i.PatientPlanId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Invoice>()
            .HasOne(i => i.Discount)
            .WithMany()
            .HasForeignKey(i => i.DiscountId)
            .OnDelete(DeleteBehavior.SetNull);

        // 3. Procurement & Finance Restrictions
        b.Entity<StockMovementLog>()
            .HasOne(m => m.Sku).WithMany().HasForeignKey(m => m.SkuId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<SupplierPayment>()
            .HasOne(p => p.Account).WithMany(a => a.SupplierPayments).HasForeignKey(p => p.AccountId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<PatientPayment>()
            .HasOne(p => p.Account).WithMany(a => a.PatientPayments).HasForeignKey(p => p.AccountId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ExpenseEntry>()
            .HasOne(e => e.Account).WithMany(a => a.ExpenseEntries).HasForeignKey(e => e.AccountId).OnDelete(DeleteBehavior.Restrict);

        b.Entity<PurchaseOrder>()
            .HasOne(po => po.Supplier).WithMany(s => s.PurchaseOrders).HasForeignKey(po => po.SupplierId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<SupplierPayment>()
            .HasOne(p => p.PurchaseOrder).WithMany(po => po.Payments).HasForeignKey(p => p.PurchaseOrderId).OnDelete(DeleteBehavior.Restrict);
    }
}