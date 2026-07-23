namespace VeraApi.DTOs.Billing;

public record ProductLineRequest(long SkuId, int Quantity);

public record WalkinCheckoutRequest(
    long PatientId,
    List<long> ServiceIds,
    List<ProductLineRequest> Products,
    decimal ManualDiscount,
    int AccountId,
    string PaymentMethod
);

public record CycleCheckoutRequest(
    long PatientPlanId,
    long CycleId,
    int AccountId,
    string PaymentMethod
);

public record InvoiceLineResult(string Label, decimal Amount);

public record CheckoutResult(
    long InvoiceId,
    string InvoiceNumber,
    decimal SubTotal,
    decimal DiscountApplied,
    decimal TaxAmount,
    decimal GrandTotal,
    string PaymentStatus
);
