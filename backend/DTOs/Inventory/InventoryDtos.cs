namespace VeraApi.DTOs.Inventory;

public record StockAdjustmentRequest(string AdjustmentType, int Quantity, string Reason);

public record PoLineRequest(long SkuId, int OrderedQuantity, decimal UnitCost);
public record CreatePurchaseOrderRequest(long SupplierId, DateTime? ExpectedDeliveryDate, List<PoLineRequest> Lines);

// One entry per PurchaseOrderItem being received. SellingPrice is optional —
// when supplied, it updates ProductSku.UnitPrice (matches the frontend's
// "Receive Goods -> assign selling price" flow).
public record ReceiveGoodsLine(long PoItemId, int ReceivedQuantityNow, decimal? SellingPrice);
public record ReceiveGoodsRequest(List<ReceiveGoodsLine> Lines);

public record CreateReturnRequest(long PurchaseOrderId, long SkuId, int Quantity, string Reason);

public record CreateSupplierPaymentRequest(long PurchaseOrderId, int AccountId, decimal AmountPaid, string PaymentMode, string? Notes);
