namespace VeraApi.Models;

public class Service
{
    public long ServiceId { get; set; }
    public string ServiceName { get; set; } = default!;
    public string ServiceCategory { get; set; } = default!;
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; } = true;
}

public static class PatientType
{
    public const string WalkIn = "WALK_IN";
    public const string Registered = "REGISTERED";
}

public class Patient
{
    public long PatientId { get; set; }
    public string PatientType { get; set; } = VeraApi.Models.PatientType.WalkIn;
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string? Email { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? MedicalHistory { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PatientTreatmentPlan> TreatmentPlans { get; set; } = new List<PatientTreatmentPlan>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public static class TreatmentPlanType
{
    public const string FixedPackage = "FIXED_PACKAGE";
    public const string PerVisit = "PER_VISIT";
}

public static class Frequency
{
    public const string Daily = "DAILY";
    public const string Weekly = "WEEKLY";
    public const string Monthly = "MONTHLY";
}

// Reusable plan template — analogous to TreatmentPlanMasterPage in the frontend.
public class TreatmentPlan
{
    public long PlanId { get; set; }
    public string PlanName { get; set; } = default!;
    public string PlanType { get; set; } = default!; // TreatmentPlanType.*
    public int NumberOfSessions { get; set; }
    public string Frequency { get; set; } = default!; // Frequency.*
    public decimal TotalPrice { get; set; }

    public ICollection<TreatmentPlanSession> Sessions { get; set; } = new List<TreatmentPlanSession>();
    public ICollection<PatientTreatmentPlan> AssignedTo { get; set; } = new List<PatientTreatmentPlan>();
}

public class TreatmentPlanSession
{
    public long SessionId { get; set; }
    public long PlanId { get; set; }
    public TreatmentPlan Plan { get; set; } = default!;
    public int SessionNumber { get; set; }
    public string SessionTitle { get; set; } = default!;

    public ICollection<TreatmentPlanSessionService> AssignedServices { get; set; } = new List<TreatmentPlanSessionService>();
    public ICollection<TreatmentPlanSessionProduct> AssignedProducts { get; set; } = new List<TreatmentPlanSessionProduct>();
    public ICollection<PlanCycle> Cycles { get; set; } = new List<PlanCycle>();
}

public class TreatmentPlanSessionService
{
    public long SessionServiceId { get; set; }
    public long SessionId { get; set; }
    public TreatmentPlanSession Session { get; set; } = default!;
    public long ServiceId { get; set; }
    public Service Service { get; set; } = default!;
}

public class TreatmentPlanSessionProduct
{
    public long SessionProductId { get; set; }
    public long SessionId { get; set; }
    public TreatmentPlanSession Session { get; set; } = default!;
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public int Quantity { get; set; }
}

public static class PatientPlanStatus
{
    public const string Active = "ACTIVE";
    public const string Completed = "COMPLETED";
    public const string Cancelled = "CANCELLED";
}

// A patient may only hold ONE row with Status == ACTIVE at a time.
// Enforced in PatientTreatmentPlansController, and additionally guarded by a
// filtered unique index in the DbContext (see VeraDbContext OnModelCreating).
public class PatientTreatmentPlan
{
    public long PatientPlanId { get; set; }
    public long PatientId { get; set; }
    public Patient Patient { get; set; } = default!;
    public long PlanId { get; set; }
    public TreatmentPlan Plan { get; set; } = default!;
    public decimal AgreedPrice { get; set; }
    public decimal BalanceRemaining { get; set; }
    public string Status { get; set; } = PatientPlanStatus.Active;
    public DateTime StartDate { get; set; }

    public ICollection<PlanCycle> Cycles { get; set; } = new List<PlanCycle>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public static class CycleStatus
{
    public const string Pending = "PENDING";
    public const string Completed = "COMPLETED";
    public const string Cancelled = "CANCELLED";
}

public class PlanCycle
{
    public long CycleId { get; set; }
    public long PatientPlanId { get; set; }
    public PatientTreatmentPlan PatientPlan { get; set; } = default!;
    public long SessionId { get; set; }
    public TreatmentPlanSession Session { get; set; } = default!;
    public int CycleNumber { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime? ExecutionDate { get; set; }
    public string Status { get; set; } = CycleStatus.Pending;
    public string? Notes { get; set; }

    public Invoice? Invoice { get; set; }
}

public static class InvoiceChannel
{
    public const string WalkIn = "WALK_IN";
    public const string Cycle = "CYCLE";
}

public static class PaymentStatus
{
    public const string Unpaid = "UNPAID";
    public const string Partial = "PARTIAL";
    public const string Paid = "PAID";
}

public class Invoice
{
    public long InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = default!;
    public long PatientId { get; set; }
    public Patient Patient { get; set; } = default!;
    public long? PatientPlanId { get; set; }
    public PatientTreatmentPlan? PatientPlan { get; set; }
    public long? CycleId { get; set; }
    public PlanCycle? Cycle { get; set; }
    public string Channel { get; set; } = InvoiceChannel.WalkIn;
    public decimal SubTotal { get; set; }
    public int? DiscountId { get; set; }
    public DiscountConfiguration? Discount { get; set; }
    public decimal ManualDiscount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string PaymentStatus { get; set; } = VeraApi.Models.PaymentStatus.Unpaid;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceService> InvoiceServices { get; set; } = new List<InvoiceService>();
    public ICollection<InvoiceProduct> InvoiceProducts { get; set; } = new List<InvoiceProduct>();
    public ICollection<PatientPayment> Payments { get; set; } = new List<PatientPayment>();
}

public class InvoiceService
{
    public long InvoiceServiceId { get; set; }
    public long InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;
    public long ServiceId { get; set; }
    public Service Service { get; set; } = default!;
    public decimal UnitPrice { get; set; }
}

public class InvoiceProduct
{
    public long InvoiceProductId { get; set; }
    public long InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class PatientPayment
{
    public long PaymentId { get; set; }
    public long InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = default!;
    public int AccountId { get; set; }
    public AccountSetup Account { get; set; } = default!;
    public decimal AmountPaid { get; set; }
    public string PaymentMethod { get; set; } = default!; // 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER'
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public long ReceivedByUserId { get; set; }
}
