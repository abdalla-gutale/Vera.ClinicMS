namespace VeraApi.Models;

public class ProductCategory
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product
{
    public long ProductId { get; set; }
    public int CategoryId { get; set; }
    public ProductCategory Category { get; set; } = default!;
    public string ProductName { get; set; } = default!;
    public string? Brand { get; set; }

    public ICollection<ProductSku> Skus { get; set; } = new List<ProductSku>();
}

public class ProductSku
{
    public long SkuId { get; set; }
    public long ProductId { get; set; }
    public Product Product { get; set; } = default!;
    public string SkuCode { get; set; } = default!;
    public string UnitOfMeasure { get; set; } = default!;
    public decimal UnitPrice { get; set; }   // selling price — updated on goods receipt
    public decimal CostPrice { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }

    public bool IsLowStock => CurrentStock <= ReorderLevel;
}

public class Supplier
{
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = default!;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public ICollection<SupplierPayment> Payments { get; set; } = new List<SupplierPayment>();
}

public static class PurchaseOrderStatus
{
    public const string Draft = "DRAFT";
    public const string Ordered = "ORDERED";
    public const string Partial = "PARTIAL";
    public const string Received = "RECEIVED";
    public const string Cancelled = "CANCELLED";
    public static readonly string[] Pipeline = { Draft, Ordered, Partial, Received };
}

public class PurchaseOrder
{
    public long PurchaseOrderId { get; set; }
    public long SupplierId { get; set; }
    public Supplier Supplier { get; set; } = default!;
    public string PoNumber { get; set; } = default!;
    public string OrderStatus { get; set; } = PurchaseOrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceRemaining => TotalAmount - PaidAmount;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    public ICollection<SupplierPayment> Payments { get; set; } = new List<SupplierPayment>();
    public ICollection<PurchaseReturn> Returns { get; set; } = new List<PurchaseReturn>();
}

public class PurchaseOrderItem
{
    public long PoItemId { get; set; }
    public long PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = default!;
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal => OrderedQuantity * UnitCost;
}

public static class MovementType
{
    public const string PoReceive = "PO_RECEIVE";
    public const string DirectSale = "DIRECT_SALE";
    public const string Adjustment = "ADJUSTMENT";
    public const string Return = "RETURN";
}

public class StockMovementLog
{
    public long MovementId { get; set; }
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public string MovementType { get; set; } = default!;
    public long? ReferenceId { get; set; } // PO id, invoice id, adjustment id, etc.
    public int QuantityChanged { get; set; } // signed
    public int StockAfterChange { get; set; }
    public long PerformedByUserId { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public class PurchaseReturn
{
    public long ReturnId { get; set; }
    public long PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = default!;
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public int Quantity { get; set; }
    public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = default!;
    public decimal TotalRefundAmount { get; set; }
}

public class SupplierPayment
{
    public long PaymentId { get; set; }
    public long SupplierId { get; set; }
    public Supplier Supplier { get; set; } = default!;
    public long PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = default!;
    public int AccountId { get; set; }
    public AccountSetup Account { get; set; } = default!;
    public decimal AmountPaid { get; set; }
    public string PaymentMode { get; set; } = default!; // 'CASH' | 'BANK_TRANSFER' | 'CHEQUE'
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public long ReceivedByUserId { get; set; }
}

public static class AdjustmentType
{
    public const string Addition = "ADDITION";
    public const string Subtraction = "SUBTRACTION";
    public const string Expiry = "EXPIRY";
    public const string Damaged = "DAMAGED";
}

public class StockAdjustment
{
    public long AdjustmentId { get; set; }
    public long SkuId { get; set; }
    public ProductSku Sku { get; set; } = default!;
    public string AdjustmentType { get; set; } = default!;
    public int Quantity { get; set; } // always positive; direction implied by AdjustmentType
    public string Reason { get; set; } = default!; // required — enforced in controller/validator
    public long PerformedByUserId { get; set; }
    public DateTime AdjustedAt { get; set; } = DateTime.UtcNow;
}
