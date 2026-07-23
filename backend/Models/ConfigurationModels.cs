using System.ComponentModel.DataAnnotations;

namespace VeraApi.Models;

public class ClinicSetting
{
    [Key]
    public int SettingId { get; set; }

    public string ClinicName { get; set; } = "VERA HAIR TRANSPLANT CLINIC";
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public decimal VatRate { get; set; } = 10.00m;
    public string? LogoUrl { get; set; }
    public string? ReportLogoUrl { get; set; }
}

public static class AccountType
{
    public const string Cash = "CASH";
    public const string MerchantPos = "MERCHANT_POS";
    public const string BankAccount = "BANK_ACCOUNT";
}

public class AccountSetup
{
    [Key]
    public int AccountId { get; set; } 
    
    public string AccountName { get; set; } = default!;
    public string AccountType { get; set; } = default!;
    public string? AccountNumber { get; set; }
    public decimal CurrentBalance { get; set; } = 0.00m;
    public bool IsActive { get; set; } = true;

    public ICollection<SupplierPayment> SupplierPayments { get; set; } = new List<SupplierPayment>();
    public ICollection<PatientPayment> PatientPayments { get; set; } = new List<PatientPayment>();
    public ICollection<ExpenseEntry> ExpenseEntries { get; set; } = new List<ExpenseEntry>();
}

public static class PaymentMethodAccountMap
{
    public static readonly Dictionary<string, string> Map = new()
    {
        ["CASH"] = AccountType.Cash,
        ["BANK_TRANSFER"] = AccountType.BankAccount,
        ["CHEQUE"] = AccountType.BankAccount,
        ["CREDIT_CARD"] = AccountType.MerchantPos,
    };
}

public class DiscountConfiguration
{
    [Key]
    public int DiscountId { get; set; }
    public string DiscountCode { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string DiscountType { get; set; } = default!;
    public decimal Value { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class SmsGateway
{
    [Key]
    public int GatewayId { get; set; }
    public string ProviderType { get; set; } = default!;
    public string? ApiKey { get; set; }
    public string? ApiSecret { get; set; }
    public string? SenderId { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<SmsTemplateGateway> TemplateLinks { get; set; } = new List<SmsTemplateGateway>();
}

public class SmsTemplate
{
    [Key]
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = default!;
    public string BodyText { get; set; } = default!;
    public string TriggerEvent { get; set; } = default!;

    public ICollection<SmsTemplateGateway> GatewayLinks { get; set; } = new List<SmsTemplateGateway>();
}

public class SmsTemplateGateway
{
    public int TemplateId { get; set; }
    public SmsTemplate Template { get; set; } = default!;
    public int GatewayId { get; set; }
    public SmsGateway Gateway { get; set; } = default!;
}

public class Module
{
    [Key]
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = default!;
    public string ModuleIcon { get; set; } = default!;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<NavPage> NavPages { get; set; } = new List<NavPage>();
}

public class NavPage
{
    [Key]
    public int NavPageId { get; set; }
    public int ModuleId { get; set; }
    public Module Module { get; set; } = default!;
    public string PageName { get; set; } = default!;
    public int? ParentPageId { get; set; }
    public string PageUrl { get; set; } = default!;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class Role
{
    [Key]
    public int RoleId { get; set; }
    public string RoleName { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class RolePermission
{
    [Key]
    public int RolePermissionId { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; } = default!;
    public int NavPageId { get; set; }
    public NavPage NavPage { get; set; } = default!;
    public bool CanCreate { get; set; }
    public bool CanRead { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}

public class ReportPermission
{
    [Key]
    public int ReportPermissionId { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; } = default!;
    public string ReportKey { get; set; } = default!;
    public bool CanAccess { get; set; }
}

public class User
{
    public long Id { get; set; }
    public string UserCode { get; set; } = default!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? Phone { get; set; }
    public string Email { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

public static class VerificationPurpose
{
    public const string Login2Fa = "LOGIN_2FA";
    public const string PasswordReset = "PASSWORD_RESET";
}

public class VerificationCode
{
    [Key]
    public long VerificationCodeId { get; set; }
    public long UserId { get; set; }
    public User User { get; set; } = default!;
    public string Purpose { get; set; } = default!;
    public string Code { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool Consumed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class RefreshToken
{
    [Key]
    public long RefreshTokenId { get; set; }
    public long UserId { get; set; }
    public User User { get; set; } = default!;
    public string TokenHash { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}