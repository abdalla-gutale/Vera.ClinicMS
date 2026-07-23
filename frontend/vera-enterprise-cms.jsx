import apiClient from './src/api/axios';
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Settings, ShieldCheck, Boxes, Scissors, Search, Bell, Plus, X, Edit2, Trash2,
  AlertTriangle, ChevronRight, ChevronDown, ChevronLeft, FileText, Truck, RotateCcw,
  Wallet, Percent, MessageSquare, Mail, Shield, UserCog, CircleUser, ArrowUpRight,
  MinusCircle, PlusCircle, CheckCircle2, Tag, Smartphone, KeyRound, ImagePlus,
  PackageCheck, ClipboardSignature, SlidersHorizontal, History, TrendingUp, Building2,
  UserPlus, Users as UsersIcon, ClipboardList, CalendarRange, CreditCard, Undo2,
  Landmark, Lock, Check, Banknote, BarChart3, TrendingDown, Repeat, CalendarCheck2,
  Receipt, PieChart, FileBarChart, Stethoscope, ArrowRightLeft, Cloud, CloudOff, RefreshCw,
  Eye, EyeOff, ArrowLeft, LogOut, MailCheck, ShieldQuestion, LayoutDashboard,
} from "lucide-react";

/* =========================================================================
   VERA HAIR TRANSPLANT CLINIC — Enterprise CMS Prototype (7 modules)
   Palette (exact): Forest #20472c · Gold #dabf84 · White #ffffff · Ink #000000
   Type: Fraunces (display, serif, luxury) + Inter (body/data)
   ========================================================================= */

const fmtMoney = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const uid = (() => { let i = 9000; return () => ++i; })();
const TODAY = "2026-07-23";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const computeScheduledDate = (startDate, frequency, sessionNumber) => {
  const d = new Date(startDate);
  const idx = sessionNumber - 1;
  if (frequency === "DAILY") d.setDate(d.getDate() + idx);
  else if (frequency === "WEEKLY") d.setDate(d.getDate() + idx * 7);
  else d.setMonth(d.getMonth() + idx);
  return d.toISOString().slice(0, 10);
};

/* ---------------------------- MOCK DATA --------------------------------- */

const seed = {
  clinicSettings: {
    clinicName: "VERA HAIR TRANSPLANT CLINIC", phone: "+1 786 555 0142", email: "care@verahairclinic.com",
    address: "220 Biscayne Terrace, Suite 5, Miami, FL", currencyCode: "USD", vatRate: 10, logoUrl: null,
  },
  accountSetups: [
    { accountId: 1, accountName: "Front Desk Cash Drawer", accountType: "CASH", accountNumber: "—", currentBalance: 1200.00, isActive: true },
    { accountId: 2, accountName: "Main POS Merchant", accountType: "MERCHANT_POS", accountNumber: "TID-88213", currentBalance: 8600.00, isActive: true },
    { accountId: 3, accountName: "Chase Business Checking", accountType: "BANK_ACCOUNT", accountNumber: "****4471", currentBalance: 42500.00, isActive: true },
  ],

  roles: [
    { roleId: 1, roleName: "Admin", description: "Full system access", createdAt: "2026-01-05" },
    { roleId: 2, roleName: "Clinic Manager", description: "Operational oversight, no system utilities", createdAt: "2026-01-05" },
    { roleId: 3, roleName: "Inventory Clerk", description: "Stock & procurement operations only", createdAt: "2026-01-10" },
  ],
  users: [
    { id: 1, userId: "U-001", roleId: 1, username: "a.reyes", fullName: "Alina Reyes", phone: "+1 786 555 0111", email: "alina@verahairclinic.com", isActive: true, createdAt: "2026-01-05" },
    { id: 2, userId: "U-002", roleId: 2, username: "d.osei", fullName: "Derek Osei", phone: "+1 786 555 0122", email: "derek@verahairclinic.com", isActive: true, createdAt: "2026-02-02" },
    { id: 3, userId: "U-003", roleId: 3, username: "m.lopez", fullName: "Mariana Lopez", phone: "+1 786 555 0133", email: "mariana@verahairclinic.com", isActive: true, createdAt: "2026-03-11" },
  ],
  modules: [
    { moduleId: 8, moduleName: "Dashboard", moduleIcon: "LayoutDashboard", displayOrder: 0, isActive: true },
    { moduleId: 1, moduleName: "System Configuration", moduleIcon: "Settings", displayOrder: 1, isActive: true },
    { moduleId: 2, moduleName: "Utilities & Access Control", moduleIcon: "ShieldCheck", displayOrder: 2, isActive: true },
    { moduleId: 3, moduleName: "Inventory Module", moduleIcon: "Boxes", displayOrder: 3, isActive: true },
    { moduleId: 4, moduleName: "Service Module", moduleIcon: "Scissors", displayOrder: 4, isActive: true },
    { moduleId: 5, moduleName: "Patient Module", moduleIcon: "UsersIcon", displayOrder: 5, isActive: true },
    { moduleId: 6, moduleName: "Expense Module", moduleIcon: "Wallet", displayOrder: 6, isActive: true },
    { moduleId: 7, moduleName: "Reports & Analytics", moduleIcon: "BarChart3", displayOrder: 7, isActive: true },
  ],
  navPages: [
    { navPageId: 24, moduleId: 8, pageName: "Dashboard", parentPageId: null, pageUrl: "dashboard", displayOrder: 1, isActive: true },
    { navPageId: 1, moduleId: 1, pageName: "System Configuration", parentPageId: null, pageUrl: "system_configuration", displayOrder: 1, isActive: true },
    { navPageId: 2, moduleId: 2, pageName: "Modules", parentPageId: null, pageUrl: "modules", displayOrder: 1, isActive: true },
    { navPageId: 3, moduleId: 2, pageName: "NavPages", parentPageId: null, pageUrl: "navpages", displayOrder: 2, isActive: true },
    { navPageId: 4, moduleId: 2, pageName: "Roles & Permissions", parentPageId: null, pageUrl: "roles_permissions", displayOrder: 3, isActive: true },
    { navPageId: 5, moduleId: 2, pageName: "Users", parentPageId: null, pageUrl: "users", displayOrder: 4, isActive: true },
    { navPageId: 6, moduleId: 3, pageName: "Products", parentPageId: null, pageUrl: "products", displayOrder: 1, isActive: true },
    { navPageId: 7, moduleId: 3, pageName: "Suppliers", parentPageId: null, pageUrl: "suppliers", displayOrder: 2, isActive: true },
    { navPageId: 8, moduleId: 3, pageName: "Purchase Orders", parentPageId: null, pageUrl: "purchase_orders", displayOrder: 3, isActive: true },
    { navPageId: 9, moduleId: 3, pageName: "Purchase Order Returns", parentPageId: null, pageUrl: "po_returns", displayOrder: 4, isActive: true },
    { navPageId: 10, moduleId: 3, pageName: "Supplier Payments", parentPageId: null, pageUrl: "supplier_payments", displayOrder: 5, isActive: true },
    { navPageId: 11, moduleId: 3, pageName: "Stock Movements", parentPageId: null, pageUrl: "stock_movements", displayOrder: 6, isActive: true },
    { navPageId: 12, moduleId: 4, pageName: "Services", parentPageId: null, pageUrl: "services", displayOrder: 1, isActive: true },
    { navPageId: 13, moduleId: 5, pageName: "Patient Directory", parentPageId: null, pageUrl: "patients", displayOrder: 1, isActive: true },
    { navPageId: 14, moduleId: 5, pageName: "Treatment Plan Master", parentPageId: null, pageUrl: "treatment_plans", displayOrder: 2, isActive: true },
    { navPageId: 15, moduleId: 5, pageName: "Active Patient Plans", parentPageId: null, pageUrl: "active_plans", displayOrder: 3, isActive: true },
    { navPageId: 16, moduleId: 5, pageName: "Billing & Invoices", parentPageId: null, pageUrl: "billing", displayOrder: 4, isActive: true },
    { navPageId: 17, moduleId: 6, pageName: "Expense Categories", parentPageId: null, pageUrl: "expense_categories", displayOrder: 1, isActive: true },
    { navPageId: 18, moduleId: 6, pageName: "Setup Expenses", parentPageId: null, pageUrl: "setup_expenses", displayOrder: 2, isActive: true },
    { navPageId: 19, moduleId: 6, pageName: "Expense Budget Estimates", parentPageId: null, pageUrl: "budget_estimates", displayOrder: 3, isActive: true },
    { navPageId: 20, moduleId: 6, pageName: "Expense Entries", parentPageId: null, pageUrl: "expense_entries", displayOrder: 4, isActive: true },
    { navPageId: 21, moduleId: 7, pageName: "Financial Reports", parentPageId: null, pageUrl: "reports_financial", displayOrder: 1, isActive: true },
    { navPageId: 22, moduleId: 7, pageName: "Clinical Reports", parentPageId: null, pageUrl: "reports_clinical", displayOrder: 2, isActive: true },
    { navPageId: 23, moduleId: 7, pageName: "Inventory Audit Reports", parentPageId: null, pageUrl: "reports_inventory", displayOrder: 3, isActive: true },
  ],
  rolePermissions: [
    ...[...Array.from({ length: 23 }, (_, i) => i + 1), 24].map((navPageId) => ({ rolePermissionId: uid(), roleId: 1, navPageId, canCreate: true, canRead: true, canUpdate: true, canDelete: true })),
    { rolePermissionId: uid(), roleId: 2, navPageId: 24, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 24, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    // Clinic Manager
    { rolePermissionId: uid(), roleId: 2, navPageId: 1, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 2, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 3, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 4, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 5, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 6, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 7, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 8, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 9, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 10, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 11, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 12, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 13, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 14, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 15, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 16, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 17, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 18, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 19, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 20, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    { rolePermissionId: uid(), roleId: 2, navPageId: 21, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 22, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 2, navPageId: 23, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    // Inventory Clerk
    { rolePermissionId: uid(), roleId: 3, navPageId: 1, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 2, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 3, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 4, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 5, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 6, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 7, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 8, canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 9, canCreate: true, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 10, canCreate: true, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 11, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 12, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 13, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 14, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 15, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 16, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 17, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 18, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 19, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 20, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 21, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 22, canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    { rolePermissionId: uid(), roleId: 3, navPageId: 23, canCreate: false, canRead: true, canUpdate: false, canDelete: false },
  ],

  discountConfigurations: [
    { discountId: 1, discountCode: "FUE10", title: "New Client FUE 10% Off", discountType: "PERCENTAGE", value: 10, startDate: "2026-06-01", endDate: "2026-09-30", isActive: true, createdAt: "2026-05-20" },
    { discountId: 2, discountCode: "REFER50", title: "Referral Reward", discountType: "FLAT", value: 50, startDate: "2026-01-01", endDate: "2026-12-31", isActive: true, createdAt: "2026-01-02" },
    { discountId: 3, discountCode: "SPRING15", title: "Spring Scalp Special", discountType: "PERCENTAGE", value: 15, startDate: "2026-02-01", endDate: "2026-04-30", isActive: true, createdAt: "2026-01-15" },
  ],
  smsGateways: [
    { gatewayId: 1, providerType: "SMS", apiKey: "twilio_sk_live_7ac2", senderId: "VERA-CLINIC", isActive: true },
    { gatewayId: 2, providerType: "EMAIL", apiKey: "smtp_key_51fd", senderId: "care@verahairclinic.com", isActive: true },
    { gatewayId: 3, providerType: "WHATSAPP", apiKey: "wa_token_c390", senderId: "+1 786 555 0142", isActive: false },
  ],
  smsTemplates: [
    { templateId: 1, gatewayIds: [1, 3], templateName: "Appointment Reminder", bodyText: "Hi {patientName}, this confirms your VERA appointment on {cycleDate}.", triggerEvent: "APPOINTMENT_REMINDER" },
    { templateId: 2, gatewayIds: [2], templateName: "Payment Receipt", bodyText: "Thank you {patientName}. VERA confirms receipt of {amount}.", triggerEvent: "PAYMENT_LOGGED" },
    { templateId: 3, gatewayIds: [1, 2], templateName: "Cycle Due Reminder", bodyText: "{patientName}, your next treatment cycle is scheduled for {cycleDate}.", triggerEvent: "CYCLE_DUE" },
  ],

  productCategories: [
    { categoryId: 1, categoryName: "Surgical Instruments", description: "Punch blades, forceps and graft handling tools" },
    { categoryId: 2, categoryName: "Consumables & Antiseptics", description: "Single-use vials, sprays and post-op supplies" },
  ],
  products: [
    { productId: 1, categoryId: 1, productName: "0.8mm Punch Blades", brand: "MicroGraft" },
    { productId: 2, categoryId: 2, productName: "PRP Separation Vials", brand: "BioSeparate" },
    { productId: 3, categoryId: 1, productName: "Surgical Forceps Set", brand: "PrecisionMed" },
    { productId: 4, categoryId: 2, productName: "Post-Op Antiseptic Spray", brand: "DermaCare" },
  ],
  productSkus: [
    { skuId: 1, productId: 1, skuCode: "PNB-08MM", unitOfMeasure: "Box (10)", unitPrice: 65.00, costPrice: 34.00, currentStock: 9, reorderLevel: 12 },
    { skuId: 2, productId: 2, skuCode: "PRP-VIAL", unitOfMeasure: "Vial", unitPrice: 8.50, costPrice: 3.75, currentStock: 210, reorderLevel: 80 },
    { skuId: 3, productId: 3, skuCode: "FCP-SET1", unitOfMeasure: "Set", unitPrice: 140.00, costPrice: 76.00, currentStock: 6, reorderLevel: 5 },
    { skuId: 4, productId: 4, skuCode: "ANT-SPR2", unitOfMeasure: "Bottle", unitPrice: 14.00, costPrice: 6.20, currentStock: 18, reorderLevel: 25 },
  ],
  suppliers: [
    { supplierId: 1, supplierName: "ScalpMed International", contactPerson: "Renata Alves", email: "orders@scalpmedintl.com", phone: "+1 954 555 0110", address: "9 Meridian Blvd, Fort Lauderdale, FL", createdAt: "2025-10-11" },
    { supplierId: 2, supplierName: "GraftPro Instruments", contactPerson: "Wallace Kim", email: "sales@graftpro.com", phone: "+1 954 555 0188", address: "301 Precision Way, Doral, FL", createdAt: "2025-11-20" },
  ],
  purchaseOrders: [
    { purchaseOrderId: 1, supplierId: 1, poNumber: "PO-VR-2201", orderStatus: "RECEIVED", totalAmount: 1190.00, paidAmount: 700.00, orderDate: "2026-07-02", expectedDeliveryDate: "2026-07-10" },
    { purchaseOrderId: 2, supplierId: 2, poNumber: "PO-VR-2202", orderStatus: "ORDERED", totalAmount: 840.00, paidAmount: 0, orderDate: "2026-07-16", expectedDeliveryDate: "2026-07-29" },
    { purchaseOrderId: 3, supplierId: 1, poNumber: "PO-VR-2203", orderStatus: "DRAFT", totalAmount: 297.50, paidAmount: 0, orderDate: "2026-07-21", expectedDeliveryDate: "2026-08-04" },
  ],
  purchaseOrderItems: [
    { poItemId: 1, purchaseOrderId: 1, skuId: 1, orderedQuantity: 14, receivedQuantity: 14, unitCost: 34.00 },
    { poItemId: 2, purchaseOrderId: 1, skuId: 3, orderedQuantity: 9, receivedQuantity: 9, unitCost: 76.00 },
    { poItemId: 3, purchaseOrderId: 2, skuId: 2, orderedQuantity: 100, receivedQuantity: 0, unitCost: 3.75 },
    { poItemId: 4, purchaseOrderId: 2, skuId: 4, orderedQuantity: 75, receivedQuantity: 0, unitCost: 6.20 },
    { poItemId: 5, purchaseOrderId: 3, skuId: 4, orderedQuantity: 25, receivedQuantity: 0, unitCost: 6.20 },
    { poItemId: 6, purchaseOrderId: 3, skuId: 2, orderedQuantity: 35, receivedQuantity: 0, unitCost: 3.75 },
  ],
  stockMovementLogs: [
    { movementId: 1, skuId: 1, movementType: "PO_RECEIVE", referenceId: 1, quantityChanged: 14, stockAfterChange: 21, performedByUserId: 3, movementDate: "2026-07-10T09:40:00", notes: "PO-VR-2201 received in full" },
    { movementId: 2, skuId: 3, movementType: "PO_RECEIVE", referenceId: 1, quantityChanged: 9, stockAfterChange: 15, performedByUserId: 3, movementDate: "2026-07-10T09:44:00", notes: "PO-VR-2201 received in full" },
    { movementId: 3, skuId: 1, movementType: "ADJUSTMENT", referenceId: null, quantityChanged: -12, stockAfterChange: 9, performedByUserId: 3, movementDate: "2026-07-18T14:05:00", notes: "Surgical usage draw-down (weekly reconciliation)" },
    { movementId: 4, skuId: 3, movementType: "ADJUSTMENT", referenceId: null, quantityChanged: -9, stockAfterChange: 6, performedByUserId: 3, movementDate: "2026-07-18T14:08:00", notes: "Surgical usage draw-down (weekly reconciliation)" },
    { movementId: 5, skuId: 2, movementType: "ADJUSTMENT", referenceId: null, quantityChanged: 210, stockAfterChange: 210, performedByUserId: 1, movementDate: "2026-06-01T08:00:00", notes: "Opening balance migration" },
    { movementId: 6, skuId: 4, movementType: "ADJUSTMENT", referenceId: null, quantityChanged: 19, stockAfterChange: 19, performedByUserId: 1, movementDate: "2026-06-01T08:00:00", notes: "Opening balance migration" },
    { movementId: 7, skuId: 3, movementType: "RETURN", referenceId: 1, quantityChanged: -3, stockAfterChange: 12, performedByUserId: 3, movementDate: "2026-07-11T11:00:00", notes: "3 forceps returned — hinge defect" },
    { movementId: 8, skuId: 4, movementType: "DIRECT_SALE", referenceId: 1, quantityChanged: -1, stockAfterChange: 18, performedByUserId: 2, movementDate: "2026-07-10T13:20:00", notes: "Sold on Invoice VERA-INV-1040" },
  ],
  purchaseReturns: [
    { returnId: 1, purchaseOrderId: 1, returnDate: "2026-07-11", reason: "3 forceps sets returned — hinge defect on delivery", totalRefundAmount: 228.00 },
  ],
  supplierPayments: [
    { paymentId: 1, supplierId: 1, purchaseOrderId: 1, accountId: 3, amountPaid: 700.00, paymentMode: "BANK_TRANSFER", paymentDate: "2026-07-13", notes: "Initial settlement", receivedByUserId: 1 },
  ],
  stockAdjustments: [
    { adjustmentId: 1, skuId: 1, adjustmentType: "SUBTRACTION", quantity: 12, reason: "Surgical usage draw-down (weekly reconciliation)", performedByUserId: 3, adjustedAt: "2026-07-18T14:05:00" },
    { adjustmentId: 2, skuId: 3, adjustmentType: "SUBTRACTION", quantity: 9, reason: "Surgical usage draw-down (weekly reconciliation)", performedByUserId: 3, adjustedAt: "2026-07-18T14:08:00" },
  ],

  services: [
    { serviceId: 1, serviceName: "FUE Hair Transplant Session (Up to 3000 Grafts)", serviceCategory: "Transplant", basePrice: 4200.00, isActive: true },
    { serviceId: 2, serviceName: "DHI Direct Hair Implantation", serviceCategory: "Transplant", basePrice: 4800.00, isActive: true },
    { serviceId: 3, serviceName: "PRP Hair Loss Treatment", serviceCategory: "Scalp Therapy", basePrice: 300.00, isActive: true },
    { serviceId: 4, serviceName: "Graft Inspection Consultation", serviceCategory: "Consultation", basePrice: 75.00, isActive: true },
    { serviceId: 5, serviceName: "Scalp Micropigmentation Touch-Up", serviceCategory: "Scalp Therapy", basePrice: 260.00, isActive: false },
  ],

  patients: [
    { patientId: 1, patientType: "REGISTERED", fullName: "Elena Marsh", phone: "+1 786 555 0201", email: "elena.marsh@example.com", dateOfBirth: "1985-04-12", gender: "Female", medicalHistory: "No known allergies.", createdAt: "2026-05-02" },
    { patientId: 2, patientType: "REGISTERED", fullName: "Oscar Bennett", phone: "+1 786 555 0212", email: "oscar.b@example.com", dateOfBirth: "1979-11-03", gender: "Male", medicalHistory: "Mild hypertension, controlled.", createdAt: "2026-05-18" },
    { patientId: 3, patientType: "WALK_IN", fullName: "Priya Shah", phone: "+1 786 555 0233", email: "", dateOfBirth: null, gender: "Female", medicalHistory: "", createdAt: "2026-07-10" },
    { patientId: 4, patientType: "REGISTERED", fullName: "Marcus Webb", phone: "+1 786 555 0244", email: "marcus.w@example.com", dateOfBirth: "1990-02-27", gender: "Male", medicalHistory: "", createdAt: "2026-06-01" },
  ],
  treatmentPlans: [
    {
      planId: 1, planName: "FUE Full Restoration Package", planType: "FIXED_PACKAGE", numberOfSessions: 3, frequency: "MONTHLY", totalPrice: 4200,
      sessions: [
        { sessionId: 1, sessionNumber: 1, sessionTitle: "Initial FUE Session", assignedServices: [1], assignedProducts: [{ skuId: 1, quantity: 1 }] },
        { sessionId: 2, sessionNumber: 2, sessionTitle: "Follow-up Density Session", assignedServices: [1], assignedProducts: [{ skuId: 1, quantity: 1 }] },
        { sessionId: 3, sessionNumber: 3, sessionTitle: "Final Touch-Up", assignedServices: [4], assignedProducts: [] },
      ],
    },
    {
      planId: 2, planName: "PRP Recovery Series", planType: "PER_VISIT", numberOfSessions: 4, frequency: "WEEKLY", totalPrice: 1200,
      sessions: [
        { sessionId: 4, sessionNumber: 1, sessionTitle: "PRP Session 1", assignedServices: [3], assignedProducts: [{ skuId: 2, quantity: 2 }] },
        { sessionId: 5, sessionNumber: 2, sessionTitle: "PRP Session 2", assignedServices: [3], assignedProducts: [{ skuId: 2, quantity: 2 }] },
        { sessionId: 6, sessionNumber: 3, sessionTitle: "PRP Session 3", assignedServices: [3], assignedProducts: [{ skuId: 2, quantity: 2 }] },
        { sessionId: 7, sessionNumber: 4, sessionTitle: "PRP Session 4", assignedServices: [3], assignedProducts: [] },
      ],
    },
  ],
  patientTreatmentPlans: [
    { patientPlanId: 1, patientId: 1, planId: 1, agreedPrice: 4200, balanceRemaining: 1400, status: "ACTIVE", startDate: "2026-06-05" },
    { patientPlanId: 2, patientId: 2, planId: 2, agreedPrice: 1200, balanceRemaining: 0, status: "COMPLETED", startDate: "2026-04-01" },
  ],
  planCycles: [
    { cycleId: 1, patientPlanId: 1, sessionId: 1, cycleNumber: 1, scheduledDate: "2026-06-05", executionDate: "2026-06-05", status: "COMPLETED", notes: "" },
    { cycleId: 2, patientPlanId: 1, sessionId: 2, cycleNumber: 2, scheduledDate: "2026-07-05", executionDate: "2026-07-06", status: "COMPLETED", notes: "" },
    { cycleId: 3, patientPlanId: 1, sessionId: 3, cycleNumber: 3, scheduledDate: "2026-08-05", executionDate: null, status: "PENDING", notes: "" },
    { cycleId: 4, patientPlanId: 2, sessionId: 4, cycleNumber: 1, scheduledDate: "2026-04-01", executionDate: "2026-04-01", status: "COMPLETED", notes: "" },
    { cycleId: 5, patientPlanId: 2, sessionId: 5, cycleNumber: 2, scheduledDate: "2026-04-08", executionDate: "2026-04-08", status: "COMPLETED", notes: "" },
    { cycleId: 6, patientPlanId: 2, sessionId: 6, cycleNumber: 3, scheduledDate: "2026-04-15", executionDate: "2026-04-16", status: "COMPLETED", notes: "" },
    { cycleId: 7, patientPlanId: 2, sessionId: 7, cycleNumber: 4, scheduledDate: "2026-04-22", executionDate: "2026-04-22", status: "COMPLETED", notes: "" },
  ],
  invoices: [
    { invoiceId: 1, invoiceNumber: "VERA-INV-1040", patientId: 3, patientPlanId: null, cycleId: null, subTotal: 89.00, discountId: null, manualDiscount: 0, taxAmount: 8.90, grandTotal: 97.90, paymentStatus: "PAID", channel: "WALK_IN", createdAt: "2026-07-10" },
    { invoiceId: 2, invoiceNumber: "VERA-INV-1041", patientId: 1, patientPlanId: 1, cycleId: 1, subTotal: 1400.00, discountId: null, manualDiscount: 0, taxAmount: 140.00, grandTotal: 1540.00, paymentStatus: "PAID", channel: "CYCLE", createdAt: "2026-06-05" },
    { invoiceId: 3, invoiceNumber: "VERA-INV-1042", patientId: 1, patientPlanId: 1, cycleId: 2, subTotal: 1400.00, discountId: null, manualDiscount: 0, taxAmount: 140.00, grandTotal: 1540.00, paymentStatus: "PAID", channel: "CYCLE", createdAt: "2026-07-06" },
  ],
  invoiceServices: [
    { invoiceServiceId: 1, invoiceId: 1, serviceId: 4, unitPrice: 75.00 },
    { invoiceServiceId: 2, invoiceId: 2, serviceId: 1, unitPrice: 1400.00 },
    { invoiceServiceId: 3, invoiceId: 3, serviceId: 1, unitPrice: 1400.00 },
  ],
  invoiceProducts: [
    { invoiceProductId: 1, invoiceId: 1, skuId: 4, quantity: 1, unitPrice: 14.00 },
  ],
  patientPayments: [
    { paymentId: 1, invoiceId: 1, accountId: 1, amountPaid: 97.90, paymentMethod: "CASH", paymentDate: "2026-07-10", receivedByUserId: 2 },
    { paymentId: 2, invoiceId: 2, accountId: 2, amountPaid: 1540.00, paymentMethod: "CREDIT_CARD", paymentDate: "2026-06-05", receivedByUserId: 1 },
    { paymentId: 3, invoiceId: 3, accountId: 3, amountPaid: 1540.00, paymentMethod: "BANK_TRANSFER", paymentDate: "2026-07-06", receivedByUserId: 1 },
  ],

  expenseCategories: [
    { categoryId: 1, categoryName: "Rent", description: "Facility lease" },
    { categoryId: 2, categoryName: "Utilities", description: "Electricity, water, internet" },
    { categoryId: 3, categoryName: "Payroll", description: "Staff salaries" },
    { categoryId: 4, categoryName: "Marketing", description: "Advertising & promotions" },
    { categoryId: 5, categoryName: "Medical Supplies", description: "Non-inventory clinical supplies" },
  ],
  setupExpenses: [
    { setupExpenseId: 1, categoryId: 1, title: "Clinic Lease — Biscayne Terrace", defaultAmount: 5200, recurringFrequency: "MONTHLY" },
    { setupExpenseId: 2, categoryId: 3, title: "Core Staff Salaries", defaultAmount: 18500, recurringFrequency: "MONTHLY" },
    { setupExpenseId: 3, categoryId: 2, title: "Utilities Bundle", defaultAmount: 640, recurringFrequency: "MONTHLY" },
  ],
  expenseBudgetEstimates: [
    { budgetId: 1, categoryId: 1, month: 7, year: 2026, budgetedAmount: 5200 },
    { budgetId: 2, categoryId: 2, month: 7, year: 2026, budgetedAmount: 700 },
    { budgetId: 3, categoryId: 3, month: 7, year: 2026, budgetedAmount: 18500 },
    { budgetId: 4, categoryId: 4, month: 7, year: 2026, budgetedAmount: 1500 },
    { budgetId: 5, categoryId: 5, month: 7, year: 2026, budgetedAmount: 900 },
  ],
  expenseEntries: [
    { expenseId: 1, categoryId: 1, accountId: 3, title: "July Rent Payment", amount: 5200, expenseDate: "2026-07-01", vendorName: "Biscayne Terrace Holdings", loggedByUserId: 1, notes: "" },
    { expenseId: 2, categoryId: 3, accountId: 3, title: "July Payroll Run", amount: 18200, expenseDate: "2026-07-05", vendorName: "ADP Payroll", loggedByUserId: 1, notes: "" },
    { expenseId: 3, categoryId: 2, accountId: 1, title: "Electricity Bill", amount: 410, expenseDate: "2026-07-08", vendorName: "FPL", loggedByUserId: 2, notes: "" },
    { expenseId: 4, categoryId: 4, accountId: 2, title: "Instagram Ad Campaign", amount: 620, expenseDate: "2026-07-15", vendorName: "Meta Ads", loggedByUserId: 2, notes: "FUE10 promo push" },
  ],
};

const MODULE_ICONS = { Settings, ShieldCheck, Boxes, Scissors, UsersIcon, Wallet, BarChart3, LayoutDashboard };
const ACCOUNT_ICONS = { CASH: Banknote, MERCHANT_POS: CreditCard, BANK_ACCOUNT: Landmark };
// Which AccountSetup.accountType a given payment method is allowed to settle into/from.
const PAYMENT_METHOD_ACCOUNT_TYPE = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_ACCOUNT",
  CHEQUE: "BANK_ACCOUNT",
  CREDIT_CARD: "MERCHANT_POS",
};
const PAYMENT_METHOD_LABELS = { CASH: "Cash", BANK_TRANSFER: "Bank Transfer", CHEQUE: "Cheque", CREDIT_CARD: "Card / POS" };
const PO_STATUSES = ["DRAFT", "ORDERED", "PARTIAL", "RECEIVED"];

/* ------------------------------ STYLE BLOCK ------------------------------ */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

      .vera-root {
        --forest: #20472c; --forest-dark: #163420; --forest-tint: #E9EFE9;
        --gold: #dabf84; --gold-dark: #9c7f42; --gold-tint: #FBF5E7;
        --ink: #14140f; --muted: #6b6a5f; --muted-2: #9a9789;
        --border: #E7E2D4; --border-soft: #F0ECE0;
        --bg: #F8F6F1; --surface: #FFFFFF; --surface-alt: #FAF8F2;
        --danger: #8C3A2B; --danger-tint: #F6E7E2;
        --success: #20472c; --success-tint: #E9EFE9;
        --navy: #163420;
        font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--ink);
      }
      .vera-root * { box-sizing: border-box; }
      .font-display { font-family: 'Fraunces', 'Inter', serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      .tabular { font-variant-numeric: tabular-nums; }
      .wordmark { font-family: 'Fraunces', serif; letter-spacing: .14em; text-transform: uppercase; }
      .vera-root ::-webkit-scrollbar { width: 8px; height: 8px; }
      .vera-root ::-webkit-scrollbar-thumb { background: #D8D2C0; border-radius: 8px; }
      .vera-root ::-webkit-scrollbar-track { background: transparent; }

      .vital-bar { box-shadow: inset 3px 0 0 0 var(--forest); }
      .vital-bar-gold { box-shadow: inset 3px 0 0 0 var(--gold-dark); }
      .vital-bar-danger { box-shadow: inset 3px 0 0 0 var(--danger); }

      .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
      .hairline { height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }

      .nav-item {
        display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px;
        color: rgba(255,255,255,0.72); font-size: 13px; font-weight: 500; cursor: pointer;
        transition: background .12s, color .12s; border: 1px solid transparent;
      }
      .nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
      .nav-item.active { background: rgba(218,191,132,0.16); color: var(--gold); box-shadow: inset 3px 0 0 0 var(--gold); font-weight: 600; }
      .nav-group-header {
        display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
        color: rgba(255,255,255,0.85); font-size: 12.5px; font-weight: 700; cursor: pointer;
        letter-spacing: .02em; text-transform: uppercase;
      }
      .nav-group-header:hover { background: rgba(255,255,255,0.06); }
      .nav-sub { padding-left: 14px; margin-left: 15px; border-left: 1px solid rgba(255,255,255,0.12); display: flex; flex-direction: column; gap: 1px; }

      .btn {
        display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600;
        border-radius: 8px; padding: 8px 14px; cursor: pointer; border: 1px solid transparent;
        transition: filter .12s, background .12s; white-space: nowrap;
      }
      .btn:active { filter: brightness(0.95); }
      .btn:focus-visible { outline: 2px solid var(--forest); outline-offset: 2px; }
      .btn-primary { background: var(--forest); color: white; }
      .btn-primary:hover { background: var(--forest-dark); }
      .btn-gold { background: var(--gold); color: var(--forest-dark); }
      .btn-gold:hover { background: #cdae6c; }
      .btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--border); }
      .btn-secondary:hover { background: var(--surface-alt); }
      .btn-ghost { background: transparent; color: var(--muted); }
      .btn-ghost:hover { background: var(--surface-alt); color: var(--ink); }
      .btn-danger { background: var(--danger-tint); color: var(--danger); }
      .btn-danger:hover { background: #EFD6CD; }
      .btn-sm { padding: 5px 10px; font-size: 12px; border-radius: 6px; }
      .btn:disabled { opacity: .4; cursor: not-allowed; }

      .input, .select, textarea.input {
        width: 100%; font-size: 13.5px; padding: 8px 11px; border: 1px solid var(--border);
        border-radius: 7px; background: var(--surface); color: var(--ink); font-family: inherit;
      }
      .input:focus, .select:focus, textarea.input:focus { outline: none; border-color: var(--forest); box-shadow: 0 0 0 3px var(--forest-tint); }
      .input:disabled, .select:disabled { background: var(--surface-alt); color: var(--muted-2); cursor: not-allowed; }
      label.field-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; display: block; }

      table.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      table.data-table thead th {
        text-align: left; font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase;
        letter-spacing: .06em; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--surface-alt);
      }
      table.data-table tbody td { padding: 12px 14px; border-bottom: 1px solid var(--border-soft); color: var(--ink); }
      table.data-table tbody tr:last-child td { border-bottom: none; }
      table.data-table tbody tr.clickable:hover { background: var(--surface-alt); cursor: pointer; }

      .badge {
        display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700;
        padding: 3px 9px; border-radius: 999px; letter-spacing: .03em; text-transform: uppercase;
      }
      .badge-forest { background: var(--forest-tint); color: var(--forest); }
      .badge-gold { background: var(--gold-tint); color: var(--gold-dark); }
      .badge-danger { background: var(--danger-tint); color: var(--danger); }
      .badge-slate { background: #F1EFE7; color: var(--muted); }

      .tab-btn { padding: 8px 4px; font-size: 13px; font-weight: 600; color: var(--muted); border-bottom: 2px solid transparent; cursor: pointer; margin-right: 22px; }
      .tab-btn.active { color: var(--forest); border-bottom-color: var(--gold); }

      .modal-overlay { position: fixed; inset: 0; background: rgba(20,20,15,0.55); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 24px; animation: fadeIn .15s ease-out; }
      .modal-panel { background: var(--surface); border-radius: 14px; width: 100%; box-shadow: 0 24px 60px rgba(20,20,15,0.35); animation: riseIn .18s ease-out; max-height: 88vh; display: flex; flex-direction: column; border-top: 3px solid var(--gold); }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes riseIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

      .drawer-overlay { position: fixed; inset: 0; background: rgba(20,20,15,0.45); z-index: 60; animation: fadeIn .15s ease-out; }
      .drawer-panel { position: fixed; top: 0; right: 0; height: 100vh; width: 440px; max-width: 92vw; background: var(--surface); box-shadow: -18px 0 40px rgba(20,20,15,0.22); z-index: 61; display: flex; flex-direction: column; animation: slideIn .2s ease-out; border-left: 3px solid var(--gold); }
      @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

      .checkbox { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid var(--border); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; background: var(--surface); }
      .checkbox.checked { background: var(--forest); border-color: var(--forest); }
      .checkbox.disabled { opacity: .4; cursor: not-allowed; }

      .bar-track { width: 100%; height: 6px; border-radius: 999px; background: #EFEBDD; overflow: hidden; }
      .bar-fill { height: 100%; border-radius: 999px; }

      .toggle { width: 34px; height: 19px; border-radius: 999px; background: #E3DECE; position: relative; cursor: pointer; transition: background .15s; flex-shrink:0; }
      .toggle.on { background: var(--forest); }
      .toggle.disabled { opacity: .45; cursor: not-allowed; }
      .toggle-knob { position: absolute; top: 2px; left: 2px; width: 15px; height: 15px; border-radius: 999px; background: white; transition: left .15s; box-shadow: 0 1px 2px rgba(0,0,0,.25); }
      .toggle.on .toggle-knob { left: 17px; }

      .focus-ring:focus-visible { outline: 2px solid var(--forest); outline-offset: 2px; }

      .seal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; position: relative; overflow: hidden; }
      .seal-card::before { content: ""; position: absolute; top: -30px; right: -30px; width: 90px; height: 90px; border-radius: 999px; background: radial-gradient(circle, var(--gold-tint) 0%, transparent 72%); }
      .seal-ring { width: 46px; height: 46px; border-radius: 999px; border: 1.5px solid var(--gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
      .seal-ring::before { content: ""; position: absolute; inset: 4px; border: 1px solid var(--gold); border-radius: 999px; opacity: .55; }

      .timeline { position: relative; padding-left: 26px; }
      .timeline::before { content: ""; position: absolute; left: 8px; top: 4px; bottom: 4px; width: 2px; background: var(--border); }
      .timeline-item { position: relative; padding-bottom: 18px; }
      .timeline-item:last-child { padding-bottom: 0; }
      .timeline-dot { position: absolute; left: -26px; top: 2px; width: 17px; height: 17px; border-radius: 999px; background: var(--surface); border: 2px solid var(--forest); display: flex; align-items: center; justify-content: center; }
      .timeline-dot.neg { border-color: var(--danger); }

      .stepper { display: flex; align-items: center; }
      .stepper-dot { width: 22px; height: 22px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border: 2px solid var(--border); color: var(--muted-2); background: var(--surface); flex-shrink: 0; }
      .stepper-dot.done { background: var(--forest); border-color: var(--forest); color: white; }
      .stepper-dot.current { background: var(--gold-tint); border-color: var(--gold); color: var(--gold-dark); }
      .stepper-line { width: 26px; height: 2px; background: var(--border); margin: 0 2px; }
      .stepper-line.done { background: var(--forest); }

      .toast { display: flex; align-items: center; gap: 10px; background: var(--forest-dark); color: white; padding: 12px 16px; border-radius: 10px; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,.28); min-width: 260px; border-left: 3px solid var(--gold); }

      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      @media (max-width: 900px) { .vera-sidebar { display: none; } }
    `}</style>
  );
}

/* ------------------------------- UI ATOMS -------------------------------- */

function Badge({ tone = "slate", children, icon: Icon }) {
  return <span className={`badge badge-${tone}`}>{Icon && <Icon size={11} strokeWidth={2.75} />}{children}</span>;
}
function Toggle({ on, onClick, disabled, label }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} disabled={disabled}
      onClick={onClick} className={`toggle ${on ? "on" : ""} ${disabled ? "disabled" : ""} focus-ring`}>
      <span className="toggle-knob" />
    </button>
  );
}
function Checkbox({ checked, onChange, disabled }) {
  return (
    <span role="checkbox" aria-checked={checked} tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onChange}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onChange(); } }}
      className={`checkbox ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} focus-ring`}>
      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}
function Modal({ title, subtitle, onClose, children, width = 640, footer }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel" style={{ maxWidth: width }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button className="btn btn-ghost btn-sm focus-ring" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
        {footer && <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}
function Drawer({ title, subtitle, onClose, children }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div className="font-display" style={{ fontSize: 15.5, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button className="btn btn-ghost btn-sm focus-ring" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </>
  );
}
// SweetAlert-style centered confirmation dialog — for destructive/impactful
// actions (log out, reset data, etc.) where an inline popover feels too light.
function SweetAlert({ icon: Icon = AlertTriangle, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "gold", onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="card" style={{ width: 380, maxWidth: "100%", padding: "30px 26px", textAlign: "center", borderTop: `3px solid ${tone === "danger" ? "var(--danger)" : "var(--gold)"}`, animation: "riseIn .18s ease-out" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: tone === "danger" ? "var(--danger-tint)" : "var(--gold-tint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icon size={26} color={tone === "danger" ? "var(--danger)" : "var(--gold-dark)"} />
        </div>
        <div className="font-display" style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary focus-ring" style={{ flex: 1, justifyContent: "center" }} onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn focus-ring ${tone === "danger" ? "btn-danger" : "btn-primary"}`} style={{ flex: 1, justifyContent: "center" }} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <div key={t} className={`tab-btn ${active === t ? "active" : ""} focus-ring`} tabIndex={0}
          onClick={() => onChange(t)} onKeyDown={(e) => { if (e.key === "Enter") onChange(t); }}>{t}</div>
      ))}
    </div>
  );
}
function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{eyebrow}</div>}
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "5px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function EmptyState({ icon: Icon, text }) {
  return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}><Icon size={24} style={{ margin: "0 auto 10px", opacity: 0.5 }} /><div style={{ fontSize: 13 }}>{text}</div></div>;
}
function NoAccessState({ text = "You don't have permission to view this page." }) {
  return (
    <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
      <Lock size={28} style={{ margin: "0 auto 12px", color: "var(--muted-2)" }} />
      <div className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Restricted</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{text}</div>
    </div>
  );
}
function Bar({ pct, color }) {
  return <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} /></div>;
}
function stockTone(sku) {
  if (sku.currentStock <= sku.reorderLevel) return { tone: "gold", color: "var(--gold-dark)" };
  return { tone: "forest", color: "var(--forest)" };
}
function StockBar({ sku }) {
  const pct = Math.min(100, Math.round((sku.currentStock / (sku.reorderLevel * 3)) * 100));
  const { color } = stockTone(sku);
  return <div style={{ minWidth: 100 }}><Bar pct={pct} color={color} /></div>;
}
const poTone = (s) => s === "RECEIVED" ? "forest" : s === "PARTIAL" ? "gold" : s === "ORDERED" ? "slate" : s === "CANCELLED" ? "danger" : "slate";

function StatCard({ label, value, sub, icon: Icon, tone }) {
  return (
    <div className={`card ${tone === "alert" ? "vital-bar-danger" : "vital-bar"}`} style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
        <Icon size={15} color="var(--gold-dark)" />
      </div>
      <div className="font-display tabular" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
function POStepper({ status }) {
  const idx = PO_STATUSES.indexOf(status);
  if (status === "CANCELLED") return <Badge tone="danger">Cancelled</Badge>;
  return (
    <div className="stepper">
      {PO_STATUSES.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`stepper-dot ${i < idx ? "done" : i === idx ? "current" : ""}`}>{i < idx ? "✓" : i + 1}</div>
          {i < PO_STATUSES.length - 1 && <div className={`stepper-line ${i < idx ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------- TOASTS ------------------------------- */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, icon) => {
    const id = uid();
    setToasts((t) => [...t, { id, message, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  return { toasts, push };
}
function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 90 }}>
      {toasts.map((t) => { const Icon = t.icon || CheckCircle2; return <div key={t.id} className="toast"><Icon size={16} color="var(--gold)" />{t.message}</div>; })}
    </div>
  );
}

/* ============================== SIDEBAR / TOPBAR ============================== */

const PAGE_META = {
  dashboard: { navPageId: 24, label: "Dashboard" },
  system_configuration: { navPageId: 1, label: "System Configuration" },
  modules: { navPageId: 2, label: "Modules" },
  navpages: { navPageId: 3, label: "NavPages" },
  roles_permissions: { navPageId: 4, label: "Roles & Permissions" },
  users: { navPageId: 5, label: "Users" },
  products: { navPageId: 6, label: "Products" },
  suppliers: { navPageId: 7, label: "Suppliers" },
  purchase_orders: { navPageId: 8, label: "Purchase Orders" },
  po_returns: { navPageId: 9, label: "Purchase Order Returns" },
  supplier_payments: { navPageId: 10, label: "Supplier Payments" },
  stock_movements: { navPageId: 11, label: "Stock Movements" },
  services: { navPageId: 12, label: "Services" },
  patients: { navPageId: 13, label: "Patient Directory" },
  treatment_plans: { navPageId: 14, label: "Treatment Plan Master" },
  active_plans: { navPageId: 15, label: "Active Patient Plans" },
  billing: { navPageId: 16, label: "Billing & Invoices" },
  expense_categories: { navPageId: 17, label: "Expense Categories" },
  setup_expenses: { navPageId: 18, label: "Setup Expenses" },
  budget_estimates: { navPageId: 19, label: "Expense Budget Estimates" },
  expense_entries: { navPageId: 20, label: "Expense Entries" },
  reports_financial: { navPageId: 21, label: "Financial Reports" },
  reports_clinical: { navPageId: 22, label: "Clinical Reports" },
  reports_inventory: { navPageId: 23, label: "Inventory Audit Reports" },
};

function Sidebar({ data, activePage, onNavigate, collapsed, setCollapsed, canRead, lowStockCount }) {
  const [openGroups, setOpenGroups] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  const visibleModules = data.modules.filter((m) => m.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="vera-sidebar" style={{ width: collapsed ? 74 : 254, background: "var(--forest-dark)", color: "white", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .15s", position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 16px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Scissors size={15} color="var(--gold)" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div className="wordmark" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1, whiteSpace: "nowrap", color: "white" }}>VERA</div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", letterSpacing: ".04em" }}>HAIR TRANSPLANT CLINIC</div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }}>
        {visibleModules.map((mod) => {
          const pages = data.navPages.filter((p) => p.moduleId === mod.moduleId && p.isActive && canRead(p.navPageId)).sort((a, b) => a.displayOrder - b.displayOrder);
          if (pages.length === 0) return null;
          const ModIcon = MODULE_ICONS[mod.moduleIcon] || Boxes;
          const isSinglePage = pages.length === 1;
          const isOpen = openGroups[mod.moduleId];
          if (isSinglePage) {
            const p = pages[0];
            return (
              <div key={mod.moduleId} className={`nav-item focus-ring ${activePage === p.pageUrl ? "active" : ""}`} tabIndex={0}
                onClick={() => onNavigate(p.pageUrl)} onKeyDown={(e) => { if (e.key === "Enter") onNavigate(p.pageUrl); }}
                title={collapsed ? mod.moduleName : undefined}>
                <ModIcon size={16} strokeWidth={2.1} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{mod.moduleName}</span>}
              </div>
            );
          }
          return (
            <div key={mod.moduleId}>
              <div className="nav-group-header focus-ring" tabIndex={0}
                onClick={() => setOpenGroups((g) => ({ ...g, [mod.moduleId]: !g[mod.moduleId] }))}
                onKeyDown={(e) => { if (e.key === "Enter") setOpenGroups((g) => ({ ...g, [mod.moduleId]: !g[mod.moduleId] })); }}>
                <ModIcon size={16} strokeWidth={2.1} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{mod.moduleName}</span>}
                {!collapsed && <ChevronDown size={13} style={{ transform: isOpen ? "none" : "rotate(-90deg)", transition: "transform .12s" }} />}
              </div>
              {!collapsed && isOpen && (
                <div className="nav-sub">
                  {pages.map((p) => {
                    const alertCount = p.pageUrl === "products" ? lowStockCount : 0;
                    return (
                      <div key={p.navPageId} className={`nav-item focus-ring ${activePage === p.pageUrl ? "active" : ""}`} tabIndex={0}
                        onClick={() => onNavigate(p.pageUrl)} onKeyDown={(e) => { if (e.key === "Enter") onNavigate(p.pageUrl); }}>
                        <span style={{ flex: 1, whiteSpace: "nowrap", fontSize: 12.5 }}>{p.pageName}</span>
                        {alertCount > 0 && <Badge tone="gold">{alertCount}</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <div className="nav-item focus-ring" tabIndex={0} onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          {!collapsed && <span>Collapse</span>}
        </div>
      </div>
    </div>
  );
}

function SaveStatusIndicator({ saveStatus, onResetClick, pushToast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const statusMeta = {
    loading: { icon: RefreshCw, label: "Loading…", color: "var(--muted)", spin: true },
    saving: { icon: RefreshCw, label: "Saving…", color: "var(--muted)", spin: true },
    saved: { icon: Cloud, label: "Saved to your account", color: "var(--forest)", spin: false },
    error: { icon: CloudOff, label: "Save failed — retrying", color: "var(--danger)", spin: false },
    idle: { icon: Cloud, label: "Synced", color: "var(--muted)", spin: false },
  }[saveStatus] || { icon: Cloud, label: "Synced", color: "var(--muted)", spin: false };
  const Icon = statusMeta.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: statusMeta.color, fontWeight: 600 }} title={statusMeta.label}>
        <Icon size={13} style={statusMeta.spin ? { animation: "spin 1s linear infinite" } : undefined} />
        <span style={{ display: "none" }} className="save-status-label">{statusMeta.label}</span>
      </div>
      <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setConfirmOpen(true)} title="Reset to demo data">
        <RefreshCw size={13} />
      </button>
      {confirmOpen && (
        <SweetAlert
          icon={RefreshCw}
          tone="danger"
          title="Reset to demo data?"
          message="This clears everything saved to your account and restores the original sample data. This can't be undone."
          confirmLabel="Reset Everything"
          cancelLabel="Cancel"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { onResetClick(); setConfirmOpen(false); pushToast?.("Data reset to the original demo set.", RefreshCw); }}
        />
      )}
    </div>
  );
}

function TopBar({ pageLabel, alertCount, data, currentRoleId, setCurrentRoleId, saveStatus, onResetClick, currentUser, onLogout, pushToast }) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const currentRole = data.roles.find((r) => r.roleId === currentRoleId);
  return (
    <div style={{ height: 64, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="wordmark" style={{ fontSize: 13, color: "var(--forest)", display: "flex", alignItems: "center", gap: 8 }}>
          VERA <span style={{ opacity: .3 }}>|</span> <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--muted)", letterSpacing: 0, textTransform: "none" }}>{pageLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--surface-alt)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--muted)" }}>
          <Building2 size={13} /> Miami — Biscayne Terrace <ChevronDown size={12} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={14} style={{ position: "absolute", left: 11, color: "var(--muted-2)" }} />
          <input className="input focus-ring" placeholder="Search patients, invoices, SKUs…" style={{ width: 230, paddingLeft: 32 }} />
        </div>
        <SaveStatusIndicator saveStatus={saveStatus} onResetClick={onResetClick} pushToast={pushToast} />
        <button className="btn btn-ghost btn-sm focus-ring" style={{ position: "relative", padding: 8 }} aria-label="Notifications">
          <Bell size={17} />
          {alertCount > 0 && <span style={{ position: "absolute", top: 4, right: 5, width: 8, height: 8, borderRadius: 99, background: "var(--gold)", border: "1.5px solid white" }} />}
        </button>
        <div style={{ position: "relative" }}>
          <div className="focus-ring" tabIndex={0} onClick={() => setRoleMenuOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 12, borderLeft: "1px solid var(--border)", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--forest-tint)", color: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
              {currentUser.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{currentUser.fullName} <ChevronDown size={11} /></div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Viewing as: {currentRole.roleName}</div>
            </div>
          </div>
          {roleMenuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setRoleMenuOpen(false)} />
              <div className="card" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50, width: 240, padding: 6, boxShadow: "0 12px 30px rgba(20,20,15,.18)" }}>
                <div style={{ padding: "8px 8px 6px", borderBottom: "1px solid var(--border-soft)", marginBottom: 4 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>@{currentUser.username} · {currentUser.email}</div>
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", padding: "6px 8px" }}>Simulate role</div>
                {data.roles.map((r) => (
                  <div key={r.roleId} onClick={() => { setCurrentRoleId(r.roleId); setRoleMenuOpen(false); pushToast?.(`Now viewing as ${r.roleName}.`, CircleUser); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 7, cursor: "pointer", fontSize: 12.5, background: r.roleId === currentRoleId ? "var(--forest-tint)" : "transparent", fontWeight: r.roleId === currentRoleId ? 700 : 500 }}>
                    <CircleUser size={14} color={r.roleId === currentRoleId ? "var(--forest)" : "var(--muted)"} /> {r.roleName}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border-soft)", marginTop: 4, paddingTop: 4 }}>
                  <div onClick={() => { setRoleMenuOpen(false); setLogoutConfirmOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 7, cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--danger)" }}>
                    <LogOut size={14} /> Log Out
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {logoutConfirmOpen && (
        <SweetAlert
          icon={LogOut}
          tone="danger"
          title="Log out of VERA CMS?"
          message="You'll need to sign in and verify your identity again to get back in."
          confirmLabel="Log Out"
          cancelLabel="Stay Signed In"
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={() => { setLogoutConfirmOpen(false); onLogout(); }}
        />
      )}
    </div>
  );
}

/* ================================== DASHBOARD ================================== */

function RevenuePulse({ points, width = 560, height = 140 }) {
  const max = Math.max(...points.map((p) => p.value)) * 1.15 || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => [i * stepX, height - (p.value / max) * (height - 22) - 8]);
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c[0]} ${c[1]}`).join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="veraPulseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dabf84" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#dabf84" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={width} y1={height * f} y2={height * f} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />)}
      <path d={area} fill="url(#veraPulseGrad)" />
      <path d={path} fill="none" stroke="#dabf84" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(218,191,132,0.55))" }} />
      {coords.map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r={i === coords.length - 1 ? 4.5 : 2.5} fill={i === coords.length - 1 ? "#dabf84" : "#B99A54"} stroke={i === coords.length - 1 ? "#163420" : "none"} strokeWidth={i === coords.length - 1 ? 2 : 0} />)}
    </svg>
  );
}

function DashboardPage({ data, perms }) {
  if (!perms.canRead) return <NoAccessState />;

  const totalRevenue = data.invoices.reduce((s, i) => s + i.grandTotal, 0);
  const walkInRevenue = data.invoices.filter((i) => i.channel === "WALK_IN").reduce((s, i) => s + i.grandTotal, 0);
  const cycleRevenue = data.invoices.filter((i) => i.channel === "CYCLE").reduce((s, i) => s + i.grandTotal, 0);
  const activePlans = data.patientTreatmentPlans.filter((p) => p.status === "ACTIVE").length;
  const lowStock = data.productSkus.filter((s) => s.currentStock <= s.reorderLevel);
  const supplierBalance = supplierLedger(data).reduce((s, x) => s + x.balance, 0);
  const patientBalance = data.patientTreatmentPlans.reduce((s, p) => s + p.balanceRemaining, 0);

  const upcomingCycles = data.planCycles
    .filter((c) => c.status === "PENDING")
    .map((c) => {
      const pp = data.patientTreatmentPlans.find((x) => x.patientPlanId === c.patientPlanId);
      const patient = data.patients.find((p) => p.patientId === pp?.patientId);
      const plan = data.treatmentPlans.find((t) => t.planId === pp?.planId);
      const session = plan?.sessions.find((s) => s.sessionId === c.sessionId);
      return { cycle: c, patient, plan, session };
    })
    .filter((x) => x.patient)
    .sort((a, b) => new Date(a.cycle.scheduledDate) - new Date(b.cycle.scheduledDate))
    .slice(0, 4);

  const revSeries = [
    { label: "Wk 1", value: totalRevenue * 0.12 || 400 }, { label: "Wk 2", value: totalRevenue * 0.22 || 900 },
    { label: "Wk 3", value: totalRevenue * 0.15 || 650 }, { label: "Wk 4", value: totalRevenue * 0.28 || 1200 },
    { label: "Wk 5", value: totalRevenue * 0.31 || 1500 }, { label: "Wk 6", value: totalRevenue * 0.24 || 1100 },
    { label: "Now", value: totalRevenue || 1600 },
  ];

  return (
    <div>
      <PageHeader eyebrow="VERA HAIR TRANSPLANT CLINIC" title="Dashboard" subtitle="Live overview of revenue, treatment plans and clinic operations." />

      <div style={{ background: "linear-gradient(160deg, var(--navy) 0%, var(--forest-dark) 100%)", borderRadius: 16, padding: "22px 24px", marginBottom: 22, borderTop: "3px solid var(--gold)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--gold)", boxShadow: "0 0 0 4px rgba(218,191,132,0.18)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".08em" }}>Revenue — All Recorded Invoices</span>
            </div>
            <div className="font-display" style={{ fontSize: 30, fontWeight: 700, color: "white" }}>{fmtMoney(totalRevenue)}</div>
            <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap" }}>
              <div><span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600 }}>● Walk-in</span> <span className="tabular" style={{ color: "white", fontSize: 12.5 }}>{fmtMoney(walkInRevenue)}</span></div>
              <div><span style={{ color: "#8FBFA0", fontSize: 12, fontWeight: 600 }}>● Cycle Visits</span> <span className="tabular" style={{ color: "white", fontSize: 12.5 }}>{fmtMoney(cycleRevenue)}</span></div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280, maxWidth: 560 }}>
            <RevenuePulse points={revSeries} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              {revSeries.map((p) => <span key={p.label} style={{ fontSize: 9.5, color: "rgba(255,255,255,0.45)" }}>{p.label}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} icon={TrendingUp} />
        <StatCard label="Active Patient Plans" value={activePlans} icon={UsersIcon} />
        <StatCard label="Low Stock SKUs" value={lowStock.length} sub={lowStock.length ? "Below reorder level" : "All healthy"} icon={AlertTriangle} tone={lowStock.length ? "alert" : undefined} />
        <StatCard label="Supplier Liabilities" value={fmtMoney(supplierBalance)} icon={Landmark} tone={supplierBalance > 0 ? "alert" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
        <div className="card vital-bar" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Upcoming Treatment Cycles</div>
            <Badge tone="gold" icon={CalendarCheck2}>{upcomingCycles.length} pending</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {upcomingCycles.map(({ cycle, patient, session }) => (
              <div key={cycle.cycleId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "var(--surface-alt)", borderRadius: 9 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{patient?.fullName} — {session?.sessionTitle}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Cycle {cycle.cycleNumber} · Scheduled {fmtDate(cycle.scheduledDate)}</div>
                </div>
                <Badge tone={new Date(cycle.scheduledDate) < new Date(TODAY) ? "danger" : "gold"}>{new Date(cycle.scheduledDate) < new Date(TODAY) ? "Overdue" : "Upcoming"}</Badge>
              </div>
            ))}
            {upcomingCycles.length === 0 && <EmptyState icon={CalendarCheck2} text="No pending cycles scheduled." />}
          </div>
        </div>

        <div className="card vital-bar-gold" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Low Stock Alerts</div>
          {lowStock.length === 0 ? <EmptyState icon={PackageCheck} text="All SKUs are above reorder level." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lowStock.map((s) => (
                <div key={s.skuId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "var(--gold-tint)", borderRadius: 8, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{s.skuCode}</span><span className="tabular">{s.currentStock} / reorder {s.reorderLevel}</span>
                </div>
              ))}
            </div>
          )}
          <div className="hairline" style={{ margin: "16px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
            <span style={{ color: "var(--muted)" }}>Patient plan balances outstanding</span>
            <span className="tabular" style={{ fontWeight: 700, color: patientBalance > 0 ? "var(--danger)" : "var(--forest)" }}>{fmtMoney(patientBalance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SYSTEM CONFIGURATION ============================ */

function AccountModal({ onClose, onSubmit }) {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("CASH");
  const [accountNumber, setAccountNumber] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  return (
    <Modal title="New Account" subtitle="Cash box, POS terminal, merchant gateway or bank account." onClose={onClose} width={440}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!accountName.trim()} onClick={() => onSubmit({ accountName, accountType, accountNumber, currentBalance: Number(currentBalance) })}><Check size={14} /> Save Account</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Account Name</label><input className="input focus-ring" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. Reception Cash Drawer" /></div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Account Type</label>
        <select className="select focus-ring" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
          <option value="CASH">Cash Box</option><option value="MERCHANT_POS">POS Terminal / Merchant Gateway</option><option value="BANK_ACCOUNT">Bank Account</option>
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label className="field-label">Account / Terminal #</label><input className="input focus-ring" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Optional" /></div>
        <div><label className="field-label">Opening Balance</label><input type="number" step="0.01" className="input focus-ring" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function SystemConfigurationPage({ data, setData, perms, pushToast }) {
  const [tab, setTab] = useState("Clinic Information");
  const [settings, setSettings] = useState(data.clinicSettings);
  const [accountModal, setAccountModal] = useState(false);
  if (!perms.canRead) return <NoAccessState />;
  const readOnly = !perms.canUpdate;

  const saveSettings = () => { setData((d) => ({ ...d, clinicSettings: settings })); pushToast("Clinic information saved."); };
  const [discForm, setDiscForm] = useState({ title: "", discountCode: "", discountType: "PERCENTAGE", value: "", startDate: TODAY, endDate: "2026-09-30" });
  const addDiscount = () => {
    if (!discForm.title || !discForm.value) return;
    setData((d) => ({ ...d, discountConfigurations: [{ discountId: uid(), ...discForm, value: Number(discForm.value), isActive: true, createdAt: TODAY }, ...d.discountConfigurations] }));
    pushToast(`Discount "${discForm.title}" created.`, Percent);
    setDiscForm({ title: "", discountCode: "", discountType: "PERCENTAGE", value: "", startDate: TODAY, endDate: "2026-09-30" });
  };
  const toggleDiscount = (id) => setData((d) => ({ ...d, discountConfigurations: d.discountConfigurations.map((x) => x.discountId === id ? { ...x, isActive: !x.isActive } : x) }));
  const discountState = (d) => {
    const inWindow = new Date(TODAY) >= new Date(d.startDate) && new Date(TODAY) <= new Date(d.endDate);
    if (!d.isActive) return { label: "Disabled", tone: "slate" };
    return inWindow ? { label: "Active", tone: "forest" } : { label: "Expired", tone: "slate" };
  };
  const toggleGateway = (id) => setData((d) => ({ ...d, smsGateways: d.smsGateways.map((g) => g.gatewayId === id ? { ...g, isActive: !g.isActive } : g) }));
  const toggleAccount = (id) => setData((d) => ({ ...d, accountSetups: d.accountSetups.map((a) => a.accountId === id ? { ...a, isActive: !a.isActive } : a) }));

  return (
    <div>
      <PageHeader eyebrow="VERA HAIR TRANSPLANT CLINIC" title="System Settings" subtitle="Clinic identity, accounts, discounts, and messaging configuration." />
      <Tabs tabs={["Clinic Information", "Account Setups", "Discount Configuration", "SMS Gateway", "SMS Templates"]} active={tab} onChange={setTab} />

      {tab === "Clinic Information" && (
        <div className="card" style={{ padding: 22, maxWidth: 600 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: "var(--surface-alt)", border: "1.5px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-2)", flexShrink: 0 }}><ImagePlus size={20} /></div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Clinic Logo</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Shown on nav bars, invoices and report headers.</div>
              <button className="btn btn-secondary btn-sm focus-ring" disabled={readOnly} style={{ width: "fit-content" }}>Upload Logo</button>
            </div>
          </div>
          <div className="hairline" style={{ marginBottom: 18 }} />
          <div style={{ marginBottom: 14 }}><label className="field-label">Clinic Name</label><input disabled={readOnly} className="input focus-ring" value={settings.clinicName} onChange={(e) => setSettings((s) => ({ ...s, clinicName: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label className="field-label">Contact Phone</label><input disabled={readOnly} className="input focus-ring" value={settings.phone} onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} /></div>
            <div><label className="field-label">Email</label><input disabled={readOnly} className="input focus-ring" value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label className="field-label">Address</label><input disabled={readOnly} className="input focus-ring" value={settings.address} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div><label className="field-label">Currency</label><select disabled={readOnly} className="select focus-ring" value={settings.currencyCode} onChange={(e) => setSettings((s) => ({ ...s, currencyCode: e.target.value }))}><option>USD</option><option>EUR</option><option>GBP</option></select></div>
            <div><label className="field-label">VAT Rate %</label><input type="number" step="0.1" disabled={readOnly} className="input focus-ring" value={settings.vatRate} onChange={(e) => setSettings((s) => ({ ...s, vatRate: Number(e.target.value) }))} /></div>
          </div>
          <button className="btn btn-primary focus-ring" disabled={readOnly} style={{ marginTop: 8 }} onClick={saveSettings}><Check size={14} /> Save Settings</button>
        </div>
      )}

      {tab === "Account Setups" && (
        <div>
          {perms.canCreate && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button className="btn btn-primary focus-ring" onClick={() => setAccountModal(true)}><Plus size={14} /> New Account</button></div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {data.accountSetups.map((a) => {
              const Icon = ACCOUNT_ICONS[a.accountType] || Landmark;
              return (
                <div key={a.accountId} className="card vital-bar-gold" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--gold-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color="var(--gold-dark)" /></div>
                      <div>
                        <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>{a.accountName}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.accountNumber}</div>
                      </div>
                    </div>
                    <Toggle on={a.isActive} disabled={readOnly} onClick={() => toggleAccount(a.accountId)} />
                  </div>
                  <Badge tone="slate">{a.accountType.replace("_", " ")}</Badge>
                  <div className="font-display tabular" style={{ fontSize: 19, fontWeight: 700, marginTop: 10, color: "var(--forest)" }}>{fmtMoney(a.currentBalance)}</div>
                </div>
              );
            })}
          </div>
          {accountModal && <AccountModal onClose={() => setAccountModal(false)} onSubmit={(payload) => { setData((d) => ({ ...d, accountSetups: [{ accountId: uid(), isActive: true, ...payload }, ...d.accountSetups] })); pushToast(`Account "${payload.accountName}" created.`); setAccountModal(false); }} />}
        </div>
      )}

      {tab === "Discount Configuration" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
          <div className="card vital-bar-gold" style={{ padding: 16, height: "fit-content" }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>New Discount</div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Title</label><input className="input focus-ring" value={discForm.title} onChange={(e) => setDiscForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Code</label><input className="input focus-ring" value={discForm.discountCode} onChange={(e) => setDiscForm((f) => ({ ...f, discountCode: e.target.value }))} placeholder="e.g. FUE10" /></div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}><label className="field-label">Type</label><select className="select focus-ring" value={discForm.discountType} onChange={(e) => setDiscForm((f) => ({ ...f, discountType: e.target.value }))}><option value="PERCENTAGE">Percent</option><option value="FLAT">Flat</option></select></div>
              <div style={{ flex: 1 }}><label className="field-label">Value</label><input type="number" className="input focus-ring" value={discForm.value} onChange={(e) => setDiscForm((f) => ({ ...f, value: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label className="field-label">Start</label><input type="date" className="input focus-ring" value={discForm.startDate} onChange={(e) => setDiscForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              <div style={{ flex: 1 }}><label className="field-label">End</label><input type="date" className="input focus-ring" value={discForm.endDate} onChange={(e) => setDiscForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <button className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center" }} onClick={addDiscount}><Percent size={14} /> Create Discount</button>
          </div>
          <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Code</th><th>Value</th><th>Window</th><th>Status</th><th>Enabled</th></tr></thead>
              <tbody>
                {data.discountConfigurations.map((d) => {
                  const state = discountState(d);
                  return (
                    <tr key={d.discountId}>
                      <td style={{ fontWeight: 600 }}>{d.title}</td>
                      <td><Badge tone="gold" icon={Tag}>{d.discountCode}</Badge></td>
                      <td className="tabular">{d.discountType === "PERCENTAGE" ? `${d.value}%` : fmtMoney(d.value)}</td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{fmtDate(d.startDate)} – {fmtDate(d.endDate)}</td>
                      <td><Badge tone={state.tone}>{state.label}</Badge></td>
                      <td><Toggle on={d.isActive} onClick={() => toggleDiscount(d.discountId)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "SMS Gateway" && (
        <div className="card vital-bar-gold" style={{ padding: 18, maxWidth: 520 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>Gateway API Keys</div>
          {data.smsGateways.map((g) => {
            const Icon = g.providerType === "SMS" ? Smartphone : g.providerType === "WHATSAPP" ? MessageSquare : Mail;
            return (
              <div key={g.gatewayId} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border-soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}><Icon size={12} /> {g.providerType}</label>
                  <Toggle on={g.isActive} onClick={() => toggleGateway(g.gatewayId)} />
                </div>
                <div style={{ position: "relative", marginBottom: 6 }}>
                  <KeyRound size={13} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted-2)" }} />
                  <input className="input focus-ring" style={{ paddingLeft: 32 }} defaultValue={g.apiKey} disabled={!g.isActive} />
                </div>
                <input className="input focus-ring" defaultValue={g.senderId} disabled={!g.isActive} placeholder="Sender ID" />
              </div>
            );
          })}
          <button className="btn btn-primary focus-ring" onClick={() => pushToast("Gateway settings saved.")}><Check size={14} /> Save Gateway Settings</button>
        </div>
      )}

      {tab === "SMS Templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
          {data.smsTemplates.map((t) => (
            <div key={t.templateId} className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>{t.templateName}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {t.gatewayIds.map((gid) => { const g = data.smsGateways.find((x) => x.gatewayId === gid); return <Badge key={gid} tone="gold">{g?.providerType}</Badge>; })}
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface-alt)", padding: "8px 10px", borderRadius: 7 }}>{t.bodyText}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 6 }}>Trigger: {t.triggerEvent} · Placeholders: <span className="font-mono">{"{patientName}"}, {"{cycleDate}"}, {"{amount}"}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ MODULES / NAVPAGES ============================ */

function ModulesPage({ data, setData, perms, pushToast }) {
  if (!perms.canRead) return <NoAccessState />;
  const toggleActive = (id) => {
    setData((d) => ({ ...d, modules: d.modules.map((m) => m.moduleId === id ? { ...m, isActive: !m.isActive } : m) }));
    const mod = data.modules.find((m) => m.moduleId === id);
    pushToast?.(`${mod?.moduleName} ${mod?.isActive ? "disabled" : "enabled"}.`);
  };
  const move = (id, dir) => setData((d) => {
    const mods = [...d.modules].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = mods.findIndex((m) => m.moduleId === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= mods.length) return d;
    const a = mods[idx].displayOrder, b = mods[swapIdx].displayOrder;
    return { ...d, modules: d.modules.map((m) => m.moduleId === mods[idx].moduleId ? { ...m, displayOrder: b } : m.moduleId === mods[swapIdx].moduleId ? { ...m, displayOrder: a } : m) };
  });
  return (
    <div>
      <PageHeader eyebrow="Utilities & Access Control" title="Modules" subtitle="Top-level navigation groups shown in the sidebar." />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Order</th><th>Module</th><th>Icon</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {[...data.modules].sort((a, b) => a.displayOrder - b.displayOrder).map((m) => {
              const Icon = MODULE_ICONS[m.moduleIcon] || Boxes;
              return (
                <tr key={m.moduleId}>
                  <td className="tabular">{m.displayOrder}</td>
                  <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Icon size={14} color="var(--forest)" />{m.moduleName}</td>
                  <td><Badge tone="slate">{m.moduleIcon}</Badge></td>
                  <td><Toggle on={m.isActive} disabled={!perms.canUpdate} onClick={() => toggleActive(m.moduleId)} /></td>
                  <td style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm focus-ring" disabled={!perms.canUpdate} onClick={() => move(m.moduleId, -1)}><ChevronRight size={13} style={{ transform: "rotate(-90deg)" }} /></button>
                    <button className="btn btn-ghost btn-sm focus-ring" disabled={!perms.canUpdate} onClick={() => move(m.moduleId, 1)}><ChevronRight size={13} style={{ transform: "rotate(90deg)" }} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NavPagesPage({ data, setData, perms, pushToast }) {
  if (!perms.canRead) return <NoAccessState />;
  const toggleActive = (id) => {
    setData((d) => ({ ...d, navPages: d.navPages.map((p) => p.navPageId === id ? { ...p, isActive: !p.isActive } : p) }));
    const page = data.navPages.find((p) => p.navPageId === id);
    pushToast?.(`${page?.pageName} ${page?.isActive ? "disabled" : "enabled"}.`);
  };
  return (
    <div>
      <PageHeader eyebrow="Utilities & Access Control" title="NavPages" subtitle="Sub-pages within each module, with URL paths and display order." />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Order</th><th>Page Name</th><th>Module</th><th>Parent Page</th><th>URL Path</th><th>Status</th></tr></thead>
          <tbody>
            {data.navPages.map((p) => (
              <tr key={p.navPageId}>
                <td className="tabular">{p.displayOrder}</td>
                <td style={{ fontWeight: 600 }}>{p.pageName}</td>
                <td><Badge tone="slate">{data.modules.find((m) => m.moduleId === p.moduleId)?.moduleName}</Badge></td>
                <td style={{ color: "var(--muted)" }}>{p.parentPageId ? data.navPages.find((x) => x.navPageId === p.parentPageId)?.pageName : "—"}</td>
                <td className="font-mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>/{p.pageUrl}</td>
                <td><Toggle on={p.isActive} disabled={!perms.canUpdate} onClick={() => toggleActive(p.navPageId)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ ROLES & PERMISSIONS ============================ */

const PERMS = ["canCreate", "canRead", "canUpdate", "canDelete"];

function RolesPermissionsPage({ data, setData, perms, pushToast }) {
  const [selectedRoleId, setSelectedRoleId] = useState(data.roles[0]?.roleId);
  if (!perms.canRead) return <NoAccessState />;
  const editable = perms.canUpdate;
  const selectedRole = data.roles.find((r) => r.roleId === selectedRoleId) || data.roles[0];

  const togglePerm = (roleId, navPageId, perm) => {
    if (!editable) return;
    setData((d) => {
      const exists = d.rolePermissions.find((rp) => rp.roleId === roleId && rp.navPageId === navPageId);
      if (exists) return { ...d, rolePermissions: d.rolePermissions.map((rp) => rp.roleId === roleId && rp.navPageId === navPageId ? { ...rp, [perm]: !rp[perm] } : rp) };
      return { ...d, rolePermissions: [...d.rolePermissions, { rolePermissionId: uid(), roleId, navPageId, canCreate: false, canRead: false, canUpdate: false, canDelete: false, [perm]: true }] };
    });
  };
  const setAllForPage = (roleId, navPageId, value) => {
    if (!editable) return;
    setData((d) => {
      const exists = d.rolePermissions.find((rp) => rp.roleId === roleId && rp.navPageId === navPageId);
      const next = { canCreate: value, canRead: value, canUpdate: value, canDelete: value };
      if (exists) return { ...d, rolePermissions: d.rolePermissions.map((rp) => rp.roleId === roleId && rp.navPageId === navPageId ? { ...rp, ...next } : rp) };
      return { ...d, rolePermissions: [...d.rolePermissions, { rolePermissionId: uid(), roleId, navPageId, ...next }] };
    });
    const page = data.navPages.find((p) => p.navPageId === navPageId);
    pushToast?.(`${value ? "Granted full" : "Cleared all"} access to ${page?.pageName} for ${selectedRole?.roleName}.`, Shield);
  };

  const rolePerms = data.navPages.map((page) => ({ page, rp: data.rolePermissions.find((x) => x.roleId === selectedRoleId && x.navPageId === page.navPageId) }));
  const accessibleCount = rolePerms.filter((x) => x.rp?.canRead).length;

  return (
    <div>
      <PageHeader eyebrow="Utilities & Access Control" title="Roles & Permissions" subtitle="Select a role to view and edit exactly which pages it can access." />
      {!editable && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "var(--gold-tint)", borderRadius: 9, marginBottom: 14, fontSize: 12, color: "var(--gold-dark)", fontWeight: 600 }}>
          <Lock size={14} /> Read-only — switch "Viewing as" to Admin in the top bar to edit permissions.
        </div>
      )}

      <div className="field-label" style={{ marginBottom: 8 }}>1. Select a Role</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {data.roles.map((role) => (
          <div key={role.roleId} onClick={() => setSelectedRoleId(role.roleId)} className="focus-ring" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setSelectedRoleId(role.roleId); }}
            style={{ cursor: "pointer", padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${selectedRoleId === role.roleId ? "var(--forest)" : "var(--border)"}`, background: selectedRoleId === role.roleId ? "var(--forest-tint)" : "var(--surface)", display: "flex", alignItems: "center", gap: 9, minWidth: 190 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: selectedRoleId === role.roleId ? "var(--forest)" : "var(--surface-alt)", color: selectedRoleId === role.roleId ? "white" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={14} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{role.roleName}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{role.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div className="field-label" style={{ marginBottom: 0 }}>2. Page Permissions for {selectedRole?.roleName}</div>
        <Badge tone="forest">{accessibleCount} / {data.navPages.length} pages accessible</Badge>
      </div>
      <div className="card" style={{ overflow: "auto" }}>
        <table className="data-table">
          <thead><tr><th>Module</th><th>Page</th>{PERMS.map((p) => <th key={p} style={{ textAlign: "center" }}>{p.replace("can", "")}</th>)}<th style={{ textAlign: "center" }}>Quick Set</th></tr></thead>
          <tbody>
            {rolePerms.map(({ page, rp }) => (
              <tr key={page.navPageId}>
                <td><Badge tone="slate">{data.modules.find((m) => m.moduleId === page.moduleId)?.moduleName}</Badge></td>
                <td style={{ fontWeight: 600 }}>{page.pageName}</td>
                {PERMS.map((perm) => (
                  <td key={perm} style={{ textAlign: "center" }}>
                    <Checkbox checked={!!rp?.[perm]} disabled={!editable} onChange={() => togglePerm(selectedRoleId, page.navPageId, perm)} />
                  </td>
                ))}
                <td style={{ textAlign: "center", display: "flex", gap: 4, justifyContent: "center" }}>
                  <button className="btn btn-ghost btn-sm focus-ring" disabled={!editable} onClick={() => setAllForPage(selectedRoleId, page.navPageId, true)}>All</button>
                  <button className="btn btn-ghost btn-sm focus-ring" disabled={!editable} onClick={() => setAllForPage(selectedRoleId, page.navPageId, false)}>None</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ USERS ============================ */

function UserModal({ user, roles, onClose, onSubmit }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [roleId, setRoleId] = useState(user?.roleId || roles[0]?.roleId);
  const valid = fullName.trim() && username.trim() && email.trim();
  return (
    <Modal title={user ? "Edit User" : "New User"} subtitle="Assign a role to control module access." onClose={onClose} width={460}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ fullName, username, email, phone, roleId: Number(roleId) })}><UserPlus size={14} /> Save User</button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">Full Name</label><input className="input focus-ring" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div><label className="field-label">Username</label><input className="input focus-ring" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">Email</label><input type="email" className="input focus-ring" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="field-label">Phone</label><input className="input focus-ring" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <div><label className="field-label">Role</label><select className="select focus-ring" value={roleId} onChange={(e) => setRoleId(e.target.value)}>{roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}</select></div>
    </Modal>
  );
}

function UsersPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  if (!perms.canRead) return <NoAccessState />;

  const saveUser = (payload) => {
    if (editing) { setData((d) => ({ ...d, users: d.users.map((u) => u.id === editing.id ? { ...u, ...payload } : u) })); pushToast(`${payload.fullName} updated.`); }
    else { setData((d) => ({ ...d, users: [{ id: uid(), userId: `U-${(d.users.length + 1).toString().padStart(3, "0")}`, isActive: true, createdAt: TODAY, ...payload }, ...d.users] })); pushToast(`${payload.fullName} added as a new user.`, UserPlus); }
    setModalOpen(false); setEditing(null);
  };
  const toggleActive = (id) => setData((d) => ({ ...d, users: d.users.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u) }));
  const resetPassword = (u) => pushToast(`Password reset link sent to ${u.email}.`, KeyRound);

  return (
    <div>
      <PageHeader eyebrow="Utilities & Access Control" title="Users" subtitle="Team profiles, role assignments and access status."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => { setEditing(null); setModalOpen(true); }}><UserPlus size={15} /> New User</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>User</th><th>Username</th><th>Contact</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><UserCog size={14} color="var(--muted)" />{u.fullName}</td>
                <td style={{ color: "var(--muted)" }}>@{u.username}</td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</td>
                <td><Badge tone="forest">{data.roles.find((r) => r.roleId === u.roleId)?.roleName}</Badge></td>
                <td><Toggle on={u.isActive} disabled={!perms.canUpdate} onClick={() => toggleActive(u.id)} /></td>
                <td style={{ display: "flex", gap: 6 }}>
                  {perms.canUpdate && <button className="btn btn-ghost btn-sm focus-ring" onClick={() => { setEditing(u); setModalOpen(true); }}><Edit2 size={13} /> Edit</button>}
                  {perms.canUpdate && <button className="btn btn-ghost btn-sm focus-ring" onClick={() => resetPassword(u)}><KeyRound size={13} /> Reset</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && <UserModal user={editing} roles={data.roles} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={saveUser} />}
    </div>
  );
}

/* ============================ PRODUCTS (Categories / Products / SKUs) ============================ */

function StockAdjustmentModal({ sku, onClose, onSubmit }) {
  const [type, setType] = useState("ADDITION");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const valid = reason.trim().length > 2 && qty > 0;
  return (
    <Modal title={`Stock Adjustment — ${sku.skuCode}`} subtitle="A reason is required; this creates an immutable audit log entry." onClose={onClose} width={460}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ type, qty: Number(qty), reason })}><Check size={14} /> Log Adjustment</button></>}>
      <div style={{ marginBottom: 12 }}>
        <label className="field-label">Adjustment Type</label>
        <select className="select focus-ring" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="ADDITION">Addition</option><option value="SUBTRACTION">Subtraction</option><option value="EXPIRY">Expiry</option><option value="DAMAGED">Damaged</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Quantity</label><input type="number" min={1} className="input focus-ring" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
      <div><label className="field-label">Reason (required)</label><textarea className="input focus-ring" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Damaged during procedure, expired batch #114…" /></div>
    </Modal>
  );
}

function AuditDrawer({ sku, data, onClose }) {
  const logs = data.stockMovementLogs.filter((l) => l.skuId === sku.skuId).sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));
  const iconFor = (type) => type === "PO_RECEIVE" ? PackageCheck : type === "ADJUSTMENT" ? SlidersHorizontal : type === "RETURN" ? RotateCcw : ArrowRightLeft;
  return (
    <Drawer title={sku.skuCode} subtitle={`${data.products.find((p) => p.productId === sku.productId)?.productName} · Stock Movement Audit`} onClose={onClose}>
      <div className="card vital-bar" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><div className="field-label">Current Stock</div><div className="font-display tabular" style={{ fontSize: 20, fontWeight: 700 }}>{sku.currentStock}</div></div>
          <div><div className="field-label">Reorder Level</div><div className="font-display tabular" style={{ fontSize: 20, fontWeight: 700, color: "var(--muted)" }}>{sku.reorderLevel}</div></div>
        </div>
      </div>
      <div className="field-label" style={{ marginBottom: 14 }}>Movement Timeline</div>
      <div className="timeline">
        {logs.map((log) => {
          const Icon = iconFor(log.movementType);
          const user = data.users.find((u) => u.id === log.performedByUserId);
          return (
            <div key={log.movementId} className="timeline-item">
              <div className={`timeline-dot ${log.quantityChanged < 0 ? "neg" : ""}`}><Icon size={9} color={log.quantityChanged < 0 ? "var(--danger)" : "var(--forest)"} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <Badge tone={log.movementType === "PO_RECEIVE" ? "forest" : log.movementType === "ADJUSTMENT" ? "gold" : "slate"}>{log.movementType.replace("_", " ")}</Badge>
                <span className="tabular" style={{ fontWeight: 700, fontSize: 12.5, color: log.quantityChanged < 0 ? "var(--danger)" : "var(--forest)" }}>{log.quantityChanged > 0 ? "+" : ""}{log.quantityChanged}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink)", marginBottom: 2 }}>{log.notes}</div>
              <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{fmtDateTime(log.movementDate)} · {user?.fullName || "System"} · balance after: <span className="tabular font-mono">{log.stockAfterChange}</span></div>
            </div>
          );
        })}
        {logs.length === 0 && <EmptyState icon={History} text="No movement history yet." />}
      </div>
    </Drawer>
  );
}

function CategoryModal({ onClose, onSubmit }) {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <Modal title="New Product Category" onClose={onClose} width={420}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!categoryName.trim()} onClick={() => onSubmit({ categoryName, description })}><Check size={14} /> Save Category</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Category Name</label><input className="input focus-ring" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /></div>
      <div><label className="field-label">Description</label><input className="input focus-ring" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
    </Modal>
  );
}

function ProductModal({ categories, onClose, onSubmit }) {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.categoryId);
  const valid = productName.trim() && brand.trim();
  return (
    <Modal title="New Product" onClose={onClose} width={440}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ productName, brand, categoryId: Number(categoryId) })}><Check size={14} /> Save Product</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Product Name</label><input className="input focus-ring" value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Brand</label><input className="input focus-ring" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
      <div><label className="field-label">Category</label><select className="select focus-ring" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>{categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
    </Modal>
  );
}

function SkuModal({ products, onClose, onSubmit }) {
  const [productId, setProductId] = useState(products[0]?.productId);
  const [skuCode, setSkuCode] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("Piece");
  const [unitPrice, setUnitPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [reorderLevel, setReorderLevel] = useState(10);
  const valid = skuCode.trim() && unitPrice !== "" && costPrice !== "";
  return (
    <Modal title="New Product SKU" onClose={onClose} width={480}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ productId: Number(productId), skuCode, unitOfMeasure, unitPrice: Number(unitPrice), costPrice: Number(costPrice), reorderLevel: Number(reorderLevel), currentStock: 0 })}><Check size={14} /> Save SKU</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Product</label><select className="select focus-ring" value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((p) => <option key={p.productId} value={p.productId}>{p.productName}</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">SKU Code</label><input className="input focus-ring" value={skuCode} onChange={(e) => setSkuCode(e.target.value)} placeholder="e.g. PNB-09MM" /></div>
        <div><label className="field-label">Unit of Measure</label><input className="input focus-ring" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div><label className="field-label">Selling Price</label><input type="number" step="0.01" className="input focus-ring" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} /></div>
        <div><label className="field-label">Cost Price</label><input type="number" step="0.01" className="input focus-ring" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} /></div>
        <div><label className="field-label">Reorder Level</label><input type="number" className="input focus-ring" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function ProductsPage({ data, setData, perms, pushToast }) {
  const [tab, setTab] = useState("Product SKUs");
  const [query, setQuery] = useState("");
  const [adjustingSku, setAdjustingSku] = useState(null);
  const [auditingSku, setAuditingSku] = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [prodModal, setProdModal] = useState(false);
  const [skuModal, setSkuModal] = useState(false);
  if (!perms.canRead) return <NoAccessState />;

  const filtered = data.productSkus.filter((s) => {
    const productName = data.products.find((p) => p.productId === s.productId)?.productName || "";
    const q = query.toLowerCase();
    return s.skuCode.toLowerCase().includes(q) || productName.toLowerCase().includes(q);
  });

  const submitAdjustment = ({ type, qty, reason }) => {
    const delta = (type === "ADDITION") ? qty : -qty;
    setData((d) => {
      const skus = d.productSkus.map((s) => s.skuId === adjustingSku.skuId ? { ...s, currentStock: Math.max(0, s.currentStock + delta) } : s);
      const newStock = skus.find((s) => s.skuId === adjustingSku.skuId).currentStock;
      return {
        ...d, productSkus: skus,
        stockAdjustments: [{ adjustmentId: uid(), skuId: adjustingSku.skuId, adjustmentType: type, quantity: qty, reason, performedByUserId: 1, adjustedAt: new Date().toISOString() }, ...d.stockAdjustments],
        stockMovementLogs: [{ movementId: uid(), skuId: adjustingSku.skuId, movementType: "ADJUSTMENT", referenceId: null, quantityChanged: delta, stockAfterChange: newStock, performedByUserId: 1, movementDate: new Date().toISOString(), notes: reason }, ...d.stockMovementLogs],
      };
    });
    pushToast(`Stock adjustment logged for ${adjustingSku.skuCode}.`, SlidersHorizontal);
    setAdjustingSku(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Products" subtitle="Categories, product master data and SKU-level stock control." />
      <Tabs tabs={["Product Categories", "Products", "Product SKUs"]} active={tab} onChange={setTab} />

      {tab === "Product Categories" && (
        <div>
          {perms.canCreate && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button className="btn btn-primary focus-ring" onClick={() => setCatModal(true)}><Plus size={14} /> New Category</button></div>}
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead><tr><th>Category</th><th>Description</th><th>Products</th></tr></thead>
              <tbody>
                {data.productCategories.map((c) => (
                  <tr key={c.categoryId}>
                    <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                    <td style={{ color: "var(--muted)" }}>{c.description}</td>
                    <td className="tabular">{data.products.filter((p) => p.categoryId === c.categoryId).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {catModal && <CategoryModal onClose={() => setCatModal(false)} onSubmit={(payload) => { setData((d) => ({ ...d, productCategories: [{ categoryId: uid(), ...payload }, ...d.productCategories] })); pushToast(`Category "${payload.categoryName}" created.`); setCatModal(false); }} />}
        </div>
      )}

      {tab === "Products" && (
        <div>
          {perms.canCreate && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button className="btn btn-primary focus-ring" onClick={() => setProdModal(true)}><Plus size={14} /> New Product</button></div>}
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>SKUs</th></tr></thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.productId}>
                    <td style={{ fontWeight: 600 }}>{p.productName}</td>
                    <td>{p.brand}</td>
                    <td><Badge tone="slate">{data.productCategories.find((c) => c.categoryId === p.categoryId)?.categoryName}</Badge></td>
                    <td className="tabular">{data.productSkus.filter((s) => s.productId === p.productId).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {prodModal && <ProductModal categories={data.productCategories} onClose={() => setProdModal(false)} onSubmit={(payload) => { setData((d) => ({ ...d, products: [{ productId: uid(), ...payload }, ...d.products] })); pushToast(`Product "${payload.productName}" created.`); setProdModal(false); }} />}
        </div>
      )}

      {tab === "Product SKUs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ position: "relative", maxWidth: 320, flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--muted-2)" }} />
              <input className="input focus-ring" placeholder="Search by SKU code or product name…" style={{ paddingLeft: 32 }} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setSkuModal(true)}><Plus size={14} /> New SKU</button>}
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead><tr><th>SKU</th><th>Product</th><th>UoM</th><th>Selling Price</th><th>Cost</th><th>Stock Level</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((s) => {
                  const product = data.products.find((p) => p.productId === s.productId);
                  const { tone } = stockTone(s);
                  return (
                    <tr key={s.skuId} className="clickable" onClick={() => setAuditingSku(s)}>
                      <td className="font-mono" style={{ fontSize: 12 }}>{s.skuCode}</td>
                      <td style={{ fontWeight: 600 }}>{product?.productName} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {product?.brand}</span></td>
                      <td>{s.unitOfMeasure}</td>
                      <td className="tabular">{fmtMoney(s.unitPrice)}</td>
                      <td className="tabular" style={{ color: "var(--muted)" }}>{fmtMoney(s.costPrice)}</td>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><StockBar sku={s} /><span className="tabular" style={{ fontSize: 12, fontWeight: 600 }}>{s.currentStock}</span></div></td>
                      <td><Badge tone={tone}>{tone === "gold" ? "Low Stock" : "Healthy"}</Badge></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {perms.canUpdate && <button className="btn btn-secondary btn-sm focus-ring" onClick={() => setAdjustingSku(s)}><SlidersHorizontal size={12} /> Adjust</button>}
                          <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setAuditingSku(s)}><History size={12} /> Audit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8}><EmptyState icon={Search} text="No SKUs match your search." /></td></tr>}
              </tbody>
            </table>
          </div>
          {skuModal && <SkuModal products={data.products} onClose={() => setSkuModal(false)} onSubmit={(payload) => { setData((d) => ({ ...d, productSkus: [{ skuId: uid(), ...payload }, ...d.productSkus] })); pushToast(`SKU "${payload.skuCode}" created.`); setSkuModal(false); }} />}
        </div>
      )}

      {adjustingSku && <StockAdjustmentModal sku={adjustingSku} onClose={() => setAdjustingSku(null)} onSubmit={submitAdjustment} />}
      {auditingSku && <AuditDrawer sku={auditingSku} data={data} onClose={() => setAuditingSku(null)} />}
    </div>
  );
}

/* ============================ SUPPLIERS ============================ */

function supplierLedger(data) {
  return data.suppliers.map((sup) => {
    const pos = data.purchaseOrders.filter((po) => po.supplierId === sup.supplierId && po.orderStatus !== "DRAFT" && po.orderStatus !== "CANCELLED");
    const billed = pos.reduce((s, po) => s + po.totalAmount, 0);
    const paid = data.supplierPayments.filter((p) => p.supplierId === sup.supplierId).reduce((s, p) => s + p.amountPaid, 0);
    const returns = data.purchaseReturns.filter((r) => pos.some((po) => po.purchaseOrderId === r.purchaseOrderId)).reduce((s, r) => s + r.totalRefundAmount, 0);
    return { supplier: sup, billed, paid, returns, balance: billed - paid - returns, poCount: pos.length };
  });
}

function SupplierModal({ onClose, onSubmit }) {
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const valid = supplierName.trim();
  return (
    <Modal title="New Supplier" onClose={onClose} width={460}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ supplierName, contactPerson, email, phone, address })}><Check size={14} /> Save Supplier</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Supplier Name</label><input className="input focus-ring" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">Contact Person</label><input className="input focus-ring" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} /></div>
        <div><label className="field-label">Phone</label><input className="input focus-ring" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Email</label><input type="email" className="input focus-ring" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label className="field-label">Address</label><input className="input focus-ring" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
    </Modal>
  );
}

function SuppliersPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (!perms.canRead) return <NoAccessState />;
  const ledger = supplierLedger(data);

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Suppliers" subtitle="Vendor profiles with total liability summaries."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Plus size={15} /> New Supplier</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {ledger.map(({ supplier, billed, paid, balance, poCount }) => (
          <div key={supplier.supplierId} className="seal-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="seal-ring"><Landmark size={16} color="var(--gold-dark)" /></div>
                <div>
                  <div className="font-display" style={{ fontWeight: 700, fontSize: 14.5 }}>{supplier.supplierName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{supplier.contactPerson} · {poCount} order{poCount !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <Badge tone={balance > 0 ? "gold" : "forest"}>{balance > 0 ? "Balance Due" : "Settled"}</Badge>
            </div>
            <div className="font-mono" style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Total Billed</span><span className="tabular">{fmtMoney(billed)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Total Paid</span><span className="tabular" style={{ color: "var(--forest)" }}>{fmtMoney(paid)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px dashed var(--border)", fontWeight: 700 }}><span>Outstanding</span><span className="tabular" style={{ color: balance > 0 ? "var(--danger)" : "var(--forest)" }}>{fmtMoney(balance)}</span></div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 3 }}>
              <span>{supplier.email}</span><span>{supplier.phone}</span><span>{supplier.address}</span>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && <SupplierModal onClose={() => setModalOpen(false)} onSubmit={(payload) => { setData((d) => ({ ...d, suppliers: [{ supplierId: uid(), createdAt: TODAY, ...payload }, ...d.suppliers] })); pushToast(`Supplier "${payload.supplierName}" added.`); setModalOpen(false); }} />}
    </div>
  );
}

/* ============================ PURCHASE ORDERS ============================ */

function POBuilderModal({ data, onClose, onSubmit }) {
  const [supplierId, setSupplierId] = useState(data.suppliers[0]?.supplierId);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("2026-08-10");
  const [lines, setLines] = useState([{ skuId: data.productSkus[0]?.skuId, orderedQuantity: 10, unitCost: data.productSkus[0]?.costPrice || 0 }]);
  const addLine = () => setLines((l) => [...l, { skuId: data.productSkus[0]?.skuId, orderedQuantity: 10, unitCost: data.productSkus[0]?.costPrice || 0 }]);
  const removeLine = (idx) => setLines((l) => l.filter((_, i) => i !== idx));
  const updateLine = (idx, patch) => setLines((l) => l.map((ln, i) => i === idx ? { ...ln, ...patch } : ln));
  const grandTotal = lines.reduce((s, l) => s + l.orderedQuantity * l.unitCost, 0);

  return (
    <Modal title="New Purchase Order" subtitle="Select supplier, add SKUs, set quantities & unit costs." onClose={onClose} width={720}
      footer={<>
        <button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary focus-ring" disabled={lines.length === 0} onClick={() => onSubmit({ supplierId: Number(supplierId), expectedDeliveryDate, lines, grandTotal })}><ClipboardSignature size={14} /> Create Draft PO</button>
      </>}>
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <div style={{ flex: 1 }}><label className="field-label">Supplier</label><select className="select focus-ring" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>{data.suppliers.map((s) => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}</select></div>
        <div style={{ flex: 1 }}><label className="field-label">Expected Delivery</label><input type="date" className="input focus-ring" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} /></div>
      </div>
      <div className="card" style={{ overflow: "auto", marginBottom: 12 }}>
        <table className="data-table">
          <thead><tr><th>SKU</th><th style={{ width: 100 }}>Qty</th><th style={{ width: 110 }}>Unit Cost</th><th>Line Total</th><th></th></tr></thead>
          <tbody>
            {lines.map((ln, idx) => (
              <tr key={idx}>
                <td><select className="select focus-ring" value={ln.skuId} onChange={(e) => updateLine(idx, { skuId: Number(e.target.value) })}>{data.productSkus.map((s) => <option key={s.skuId} value={s.skuId}>{s.skuCode} — {data.products.find((p) => p.productId === s.productId)?.productName}</option>)}</select></td>
                <td><input type="number" min={1} className="input focus-ring" value={ln.orderedQuantity} onChange={(e) => updateLine(idx, { orderedQuantity: Number(e.target.value) })} /></td>
                <td><input type="number" min={0} step="0.01" className="input focus-ring" value={ln.unitCost} onChange={(e) => updateLine(idx, { unitCost: Number(e.target.value) })} /></td>
                <td className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(ln.orderedQuantity * ln.unitCost)}</td>
                <td>{lines.length > 1 && <button className="btn btn-ghost btn-sm focus-ring" onClick={() => removeLine(idx)}><Trash2 size={13} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-secondary btn-sm focus-ring" onClick={addLine} style={{ marginBottom: 16 }}><Plus size={13} /> Add Line</button>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface-alt)", borderRadius: 9 }}>
        <span className="font-display" style={{ fontWeight: 700, fontSize: 14 }}>Grand Total</span>
        <span className="font-display tabular" style={{ fontWeight: 700, fontSize: 15, color: "var(--forest)" }}>{fmtMoney(grandTotal)}</span>
      </div>
    </Modal>
  );
}

function ReceiveGoodsModal({ po, data, onClose, onSubmit }) {
  const items = data.purchaseOrderItems.filter((i) => i.purchaseOrderId === po.purchaseOrderId);
  const [received, setReceived] = useState(() => { const m = {}; items.forEach((i) => m[i.poItemId] = Math.max(0, i.orderedQuantity - i.receivedQuantity)); return m; });
  const [sellingPrices, setSellingPrices] = useState(() => { const m = {}; items.forEach((i) => { const sku = data.productSkus.find((s) => s.skuId === i.skuId); m[i.poItemId] = sku?.unitPrice ?? 0; }); return m; });
  return (
    <Modal title={`Receive Goods — ${po.poNumber}`} subtitle="Enter received quantities and confirm the selling price per line. Stock and audit logs update automatically." onClose={onClose} width={720}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" onClick={() => onSubmit(received, sellingPrices)}><PackageCheck size={14} /> Confirm Receipt</button></>}>
      <div className="card" style={{ overflow: "auto" }}>
        <table className="data-table">
          <thead><tr><th>SKU</th><th>Ordered</th><th>Already Received</th><th style={{ width: 120 }}>Receiving Now</th><th style={{ width: 130 }}>Selling Price</th></tr></thead>
          <tbody>
            {items.map((item) => {
              const sku = data.productSkus.find((s) => s.skuId === item.skuId);
              const remaining = item.orderedQuantity - item.receivedQuantity;
              return (
                <tr key={item.poItemId}>
                  <td style={{ fontWeight: 600 }}>{sku?.skuCode} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {data.products.find((p) => p.productId === sku?.productId)?.productName}</span></td>
                  <td className="tabular">{item.orderedQuantity}</td>
                  <td className="tabular">{item.receivedQuantity}</td>
                  <td><input type="number" min={0} max={remaining} className="input focus-ring" value={received[item.poItemId]} onChange={(e) => setReceived((r) => ({ ...r, [item.poItemId]: Math.max(0, Math.min(remaining, Number(e.target.value))) }))} /></td>
                  <td><input type="number" min={0} step="0.01" className="input focus-ring" value={sellingPrices[item.poItemId]} onChange={(e) => setSellingPrices((r) => ({ ...r, [item.poItemId]: Math.max(0, Number(e.target.value)) }))} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--gold-tint)", borderRadius: 9, marginTop: 12, fontSize: 12, color: "var(--gold-dark)", fontWeight: 600 }}>
        <Tag size={13} /> Confirming receipt updates each SKU's selling price on the Product SKUs page.
      </div>
    </Modal>
  );
}

function PurchaseOrdersPage({ data, setData, perms, pushToast }) {
  const [building, setBuilding] = useState(false);
  const [receiving, setReceiving] = useState(null);
  if (!perms.canRead) return <NoAccessState />;

  const createPO = ({ supplierId, expectedDeliveryDate, lines, grandTotal }) => {
    const poId = uid();
    setData((d) => ({
      ...d,
      purchaseOrders: [{ purchaseOrderId: poId, supplierId, poNumber: `PO-VR-${2200 + d.purchaseOrders.length + 1}`, orderStatus: "DRAFT", totalAmount: grandTotal, paidAmount: 0, orderDate: TODAY, expectedDeliveryDate }, ...d.purchaseOrders],
      purchaseOrderItems: [...lines.map((l) => ({ poItemId: uid(), purchaseOrderId: poId, skuId: l.skuId, orderedQuantity: l.orderedQuantity, receivedQuantity: 0, unitCost: l.unitCost })), ...d.purchaseOrderItems],
    }));
    pushToast("Draft purchase order created.", ClipboardSignature);
    setBuilding(false);
  };
  const advanceToOrdered = (po) => { setData((d) => ({ ...d, purchaseOrders: d.purchaseOrders.map((x) => x.purchaseOrderId === po.purchaseOrderId ? { ...x, orderStatus: "ORDERED" } : x) })); pushToast(`${po.poNumber} marked as Ordered.`); };

  const receiveGoods = (receivedMap, sellingPrices) => {
    setData((d) => {
      let skus = d.productSkus.map((s) => ({ ...s }));
      const newLogs = [];
      const items = d.purchaseOrderItems.map((item) => {
        if (item.purchaseOrderId !== receiving.purchaseOrderId) return item;
        const qty = receivedMap[item.poItemId] || 0;
        const newPrice = sellingPrices ? sellingPrices[item.poItemId] : undefined;
        const sku = skus.find((s) => s.skuId === item.skuId);
        if (qty > 0) {
          sku.currentStock = sku.currentStock + qty;
          newLogs.push({ movementId: uid(), skuId: item.skuId, movementType: "PO_RECEIVE", referenceId: receiving.purchaseOrderId, quantityChanged: qty, stockAfterChange: sku.currentStock, performedByUserId: 1, movementDate: new Date().toISOString(), notes: `${receiving.poNumber} goods receipt` });
        }
        if (newPrice != null && !Number.isNaN(newPrice) && (qty > 0 || newPrice !== sku.unitPrice)) {
          sku.unitPrice = newPrice;
        }
        return { ...item, receivedQuantity: item.receivedQuantity + qty };
      });
      const poItemsForThis = items.filter((i) => i.purchaseOrderId === receiving.purchaseOrderId);
      const fullyReceived = poItemsForThis.every((i) => i.receivedQuantity >= i.orderedQuantity);
      const anyReceived = poItemsForThis.some((i) => i.receivedQuantity > 0);
      const newStatus = fullyReceived ? "RECEIVED" : anyReceived ? "PARTIAL" : receiving.orderStatus;
      const purchaseOrders = d.purchaseOrders.map((po) => po.purchaseOrderId === receiving.purchaseOrderId ? { ...po, orderStatus: newStatus } : po);
      return { ...d, productSkus: skus, purchaseOrderItems: items, purchaseOrders, stockMovementLogs: [...newLogs, ...d.stockMovementLogs] };
    });
    pushToast(`Goods received for ${receiving.poNumber}. Stock, selling price & audit log updated.`, PackageCheck);
    setReceiving(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Purchase Orders" subtitle="Build orders and process goods receipt against supplier SKUs."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setBuilding(true)}><Plus size={15} /> New Purchase Order</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Order Date</th><th>Expected</th><th>Total</th><th>Paid</th><th>Balance</th><th>Pipeline</th><th></th></tr></thead>
          <tbody>
            {data.purchaseOrders.map((po) => (
              <tr key={po.purchaseOrderId}>
                <td style={{ fontWeight: 700 }}>{po.poNumber}</td>
                <td>{data.suppliers.find((s) => s.supplierId === po.supplierId)?.supplierName}</td>
                <td>{fmtDate(po.orderDate)}</td>
                <td>{fmtDate(po.expectedDeliveryDate)}</td>
                <td className="tabular">{fmtMoney(po.totalAmount)}</td>
                <td className="tabular" style={{ color: "var(--forest)" }}>{fmtMoney(po.paidAmount)}</td>
                <td className="tabular" style={{ color: po.totalAmount - po.paidAmount > 0 ? "var(--danger)" : "var(--forest)", fontWeight: 700 }}>{fmtMoney(po.totalAmount - po.paidAmount)}</td>
                <td><POStepper status={po.orderStatus} /></td>
                <td style={{ display: "flex", gap: 6 }}>
                  {perms.canUpdate && po.orderStatus === "DRAFT" && <button className="btn btn-secondary btn-sm focus-ring" onClick={() => advanceToOrdered(po)}>Mark Ordered</button>}
                  {perms.canUpdate && (po.orderStatus === "ORDERED" || po.orderStatus === "PARTIAL") && <button className="btn btn-primary btn-sm focus-ring" onClick={() => setReceiving(po)}><PackageCheck size={13} /> Receive Goods</button>}
                  {po.orderStatus === "RECEIVED" && <Badge tone="forest" icon={CheckCircle2}>Complete</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {building && <POBuilderModal data={data} onClose={() => setBuilding(false)} onSubmit={createPO} />}
      {receiving && <ReceiveGoodsModal po={receiving} data={data} onClose={() => setReceiving(null)} onSubmit={receiveGoods} />}
    </div>
  );
}

/* ============================ PURCHASE ORDER RETURNS ============================ */

function ReturnModal({ data, onClose, onSubmit }) {
  const receivedPOs = data.purchaseOrders.filter((po) => po.orderStatus === "RECEIVED" || po.orderStatus === "PARTIAL");
  const [purchaseOrderId, setPurchaseOrderId] = useState(receivedPOs[0]?.purchaseOrderId);
  const items = data.purchaseOrderItems.filter((i) => i.purchaseOrderId === Number(purchaseOrderId) && i.receivedQuantity > 0);
  const [skuId, setSkuId] = useState(items[0]?.skuId);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const unitCost = data.purchaseOrderItems.find((i) => i.purchaseOrderId === Number(purchaseOrderId) && i.skuId === Number(skuId))?.unitCost || 0;
  const refund = unitCost * qty;
  const valid = reason.trim().length > 2 && qty > 0 && skuId;
  return (
    <Modal title="New Purchase Order Return" subtitle="Log defective or rejected stock and its credit note value." onClose={onClose} width={520}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ purchaseOrderId: Number(purchaseOrderId), skuId: Number(skuId), qty: Number(qty), reason, refund })}><Undo2 size={14} /> Log Return</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Purchase Order</label>
        <select className="select focus-ring" value={purchaseOrderId} onChange={(e) => { setPurchaseOrderId(e.target.value); setSkuId(undefined); }}>
          {receivedPOs.map((po) => <option key={po.purchaseOrderId} value={po.purchaseOrderId}>{po.poNumber} — {data.suppliers.find((s) => s.supplierId === po.supplierId)?.supplierName}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label className="field-label">SKU</label>
          <select className="select focus-ring" value={skuId} onChange={(e) => setSkuId(e.target.value)}>
            {items.map((i) => { const sku = data.productSkus.find((s) => s.skuId === i.skuId); return <option key={i.skuId} value={i.skuId}>{sku?.skuCode}</option>; })}
          </select>
        </div>
        <div style={{ width: 110 }}><label className="field-label">Quantity</label><input type="number" min={1} className="input focus-ring" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Reason (required)</label><textarea className="input focus-ring" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Hinge defect on delivery" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 9, fontSize: 12.5 }}>
        <span style={{ color: "var(--muted)" }}>Credit note value</span><span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(refund)}</span>
      </div>
    </Modal>
  );
}

function POReturnsPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (!perms.canRead) return <NoAccessState />;

  const submitReturn = ({ purchaseOrderId, skuId, qty, reason, refund }) => {
    setData((d) => {
      const skus = d.productSkus.map((s) => s.skuId === skuId ? { ...s, currentStock: Math.max(0, s.currentStock - qty) } : s);
      const newStock = skus.find((s) => s.skuId === skuId).currentStock;
      const po = d.purchaseOrders.find((p) => p.purchaseOrderId === purchaseOrderId);
      return {
        ...d, productSkus: skus,
        purchaseReturns: [{ returnId: uid(), purchaseOrderId, returnDate: TODAY, reason, totalRefundAmount: refund }, ...d.purchaseReturns],
        stockMovementLogs: [{ movementId: uid(), skuId, movementType: "RETURN", referenceId: purchaseOrderId, quantityChanged: -qty, stockAfterChange: newStock, performedByUserId: 1, movementDate: new Date().toISOString(), notes: `${po.poNumber} return — ${reason}` }, ...d.stockMovementLogs],
      };
    });
    pushToast("Purchase order return logged.", Undo2);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Purchase Order Returns" subtitle="Defective or rejected stock, with credit note values against suppliers."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Plus size={15} /> New Return</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Return #</th><th>PO #</th><th>Supplier</th><th>Date</th><th>Reason</th><th>Credit Note</th></tr></thead>
          <tbody>
            {data.purchaseReturns.map((r) => {
              const po = data.purchaseOrders.find((p) => p.purchaseOrderId === r.purchaseOrderId);
              return (
                <tr key={r.returnId}>
                  <td style={{ fontWeight: 700 }}>RET-{r.returnId}</td>
                  <td>{po?.poNumber}</td>
                  <td>{data.suppliers.find((s) => s.supplierId === po?.supplierId)?.supplierName}</td>
                  <td>{fmtDate(r.returnDate)}</td>
                  <td style={{ color: "var(--muted)" }}>{r.reason}</td>
                  <td className="tabular" style={{ fontWeight: 700, color: "var(--gold-dark)" }}>{fmtMoney(r.totalRefundAmount)}</td>
                </tr>
              );
            })}
            {data.purchaseReturns.length === 0 && <tr><td colSpan={6}><EmptyState icon={Undo2} text="No returns logged yet." /></td></tr>}
          </tbody>
        </table>
      </div>
      {modalOpen && <ReturnModal data={data} onClose={() => setModalOpen(false)} onSubmit={submitReturn} />}
    </div>
  );
}

/* ============================ SUPPLIER PAYMENTS ============================ */

function AddSupplierPaymentModal({ data, onClose, onSubmit }) {
  const openPOs = data.purchaseOrders.filter((po) => po.orderStatus !== "DRAFT" && po.orderStatus !== "CANCELLED" && po.totalAmount - po.paidAmount > 0);
  const [poId, setPoId] = useState(openPOs[0]?.purchaseOrderId);
  const [mode, setMode] = useState("BANK_TRANSFER");
  const matchingAccounts = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[mode]);
  const [accountId, setAccountId] = useState(matchingAccounts[0]?.accountId);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const selectedPO = data.purchaseOrders.find((p) => p.purchaseOrderId === Number(poId));
  const supplier = data.suppliers.find((s) => s.supplierId === selectedPO?.supplierId);
  const balance = selectedPO ? selectedPO.totalAmount - selectedPO.paidAmount : 0;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const next = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[newMode]);
    setAccountId(next[0]?.accountId);
  };

  return (
    <Modal title="Log Supplier Payment" subtitle="The account list is filtered to accounts matching the selected payment mode." onClose={onClose} width={480}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!amount || Number(amount) <= 0 || !accountId} onClick={() => onSubmit({ purchaseOrderId: Number(poId), supplierId: selectedPO.supplierId, accountId: Number(accountId), amountPaid: Number(amount), paymentMode: mode, notes })}><Wallet size={14} /> Log Payment</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Purchase Order</label>
        <select className="select focus-ring" value={poId} onChange={(e) => setPoId(e.target.value)}>
          {openPOs.map((po) => <option key={po.purchaseOrderId} value={po.purchaseOrderId}>{po.poNumber} · {data.suppliers.find((s) => s.supplierId === po.supplierId)?.supplierName} · Balance {fmtMoney(po.totalAmount - po.paidAmount)}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Payment Mode</label>
        <select className="select focus-ring" value={mode} onChange={(e) => handleModeChange(e.target.value)}>
          <option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CHEQUE">Cheque</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Pay From Account</label>
        {matchingAccounts.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--danger)", padding: "8px 10px", background: "var(--danger-tint)", borderRadius: 7 }}>No active {ACCOUNT_ICONS[PAYMENT_METHOD_ACCOUNT_TYPE[mode]] ? PAYMENT_METHOD_ACCOUNT_TYPE[mode].replace("_", " ") : ""} account is available for this payment mode.</div>
        ) : (
          <select className="select focus-ring" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {matchingAccounts.map((a) => <option key={a.accountId} value={a.accountId}>{a.accountName} · {fmtMoney(a.currentBalance)} available</option>)}
          </select>
        )}
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Amount</label><input type="number" min="0" max={balance} className="input focus-ring" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
      <div style={{ marginBottom: 14 }}><label className="field-label">Notes</label><input className="input focus-ring" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional reference note" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 9, fontSize: 12.5 }}>
        <span style={{ color: "var(--muted)" }}>Outstanding balance on {selectedPO?.poNumber} ({supplier?.supplierName})</span>
        <span className="tabular" style={{ fontWeight: 700, color: "var(--danger)" }}>{fmtMoney(balance)}</span>
      </div>
    </Modal>
  );
}

function SupplierPaymentsPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (!perms.canRead) return <NoAccessState />;

  const logPayment = ({ purchaseOrderId, supplierId, accountId, amountPaid, paymentMode, notes }) => {
    setData((d) => ({
      ...d,
      purchaseOrders: d.purchaseOrders.map((po) => po.purchaseOrderId === purchaseOrderId ? { ...po, paidAmount: Math.min(po.totalAmount, po.paidAmount + amountPaid) } : po),
      accountSetups: d.accountSetups.map((a) => a.accountId === accountId ? { ...a, currentBalance: a.currentBalance - amountPaid } : a),
      supplierPayments: [{ paymentId: uid(), supplierId, purchaseOrderId, accountId, amountPaid, paymentMode, paymentDate: TODAY, notes, receivedByUserId: 1 }, ...d.supplierPayments],
    }));
    pushToast(`Payment of ${fmtMoney(amountPaid)} logged.`, Wallet);
    setModalOpen(false);
  };

  const totalBilled = data.purchaseOrders.filter((po) => po.orderStatus !== "DRAFT" && po.orderStatus !== "CANCELLED").reduce((s, po) => s + po.totalAmount, 0);
  const totalPaid = data.supplierPayments.reduce((s, p) => s + p.amountPaid, 0);

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Supplier Payments" subtitle="Execute full or partial payments against open purchase orders, from a chosen account."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Wallet size={15} /> Add Payment</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Billed" value={fmtMoney(totalBilled)} icon={ClipboardList} />
        <StatCard label="Total Paid" value={fmtMoney(totalPaid)} icon={Wallet} />
        <StatCard label="Outstanding" value={fmtMoney(totalBilled - totalPaid)} icon={AlertTriangle} tone={totalBilled - totalPaid > 0 ? "alert" : undefined} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Payment #</th><th>Supplier</th><th>PO #</th><th>Account</th><th>Date</th><th>Amount</th><th>Mode</th></tr></thead>
          <tbody>
            {data.supplierPayments.map((p) => (
              <tr key={p.paymentId}>
                <td style={{ fontWeight: 700 }}>PAY-{p.paymentId}</td>
                <td>{data.suppliers.find((s) => s.supplierId === p.supplierId)?.supplierName}</td>
                <td>{data.purchaseOrders.find((po) => po.purchaseOrderId === p.purchaseOrderId)?.poNumber}</td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>{data.accountSetups.find((a) => a.accountId === p.accountId)?.accountName || "—"}</td>
                <td>{fmtDate(p.paymentDate)}</td>
                <td className="tabular" style={{ fontWeight: 700, color: "var(--forest)" }}>{fmtMoney(p.amountPaid)}</td>
                <td><Badge tone="slate">{p.paymentMode.replace("_", " ")}</Badge></td>
              </tr>
            ))}
            {data.supplierPayments.length === 0 && <tr><td colSpan={7}><EmptyState icon={Wallet} text="No payments logged yet." /></td></tr>}
          </tbody>
        </table>
      </div>
      {modalOpen && <AddSupplierPaymentModal data={data} onClose={() => setModalOpen(false)} onSubmit={logPayment} />}
    </div>
  );
}

/* ============================ STOCK MOVEMENTS ============================ */

function StockMovementsPage({ data, perms }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  if (!perms.canRead) return <NoAccessState />;

  const logs = data.stockMovementLogs
    .filter((l) => typeFilter === "ALL" || l.movementType === typeFilter)
    .filter((l) => {
      const sku = data.productSkus.find((s) => s.skuId === l.skuId);
      const q = query.toLowerCase();
      return !q || sku?.skuCode.toLowerCase().includes(q) || data.products.find((p) => p.productId === sku?.productId)?.productName.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));

  const typeTone = (t) => t === "PO_RECEIVE" ? "forest" : t === "ADJUSTMENT" ? "gold" : t === "RETURN" ? "danger" : "slate";

  return (
    <div>
      <PageHeader eyebrow="Inventory Module" title="Stock Movements" subtitle="Immutable audit log of every stock increase, sale, adjustment and return." />
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ position: "relative", maxWidth: 280, flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--muted-2)" }} />
          <input className="input focus-ring" placeholder="Search by SKU or product…" style={{ paddingLeft: 32 }} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {["ALL", "PO_RECEIVE", "DIRECT_SALE", "ADJUSTMENT", "RETURN"].map((t) => (
          <button key={t} className={`btn btn-sm focus-ring ${typeFilter === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setTypeFilter(t)}>{t === "ALL" ? "All" : t.replace("_", " ")}</button>
        ))}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>SKU</th><th>Movement</th><th>Qty Change</th><th>Balance After</th><th>Performed By</th><th>Notes</th></tr></thead>
          <tbody>
            {logs.map((l) => {
              const sku = data.productSkus.find((s) => s.skuId === l.skuId);
              const user = data.users.find((u) => u.id === l.performedByUserId);
              return (
                <tr key={l.movementId}>
                  <td style={{ fontSize: 12 }}>{fmtDateTime(l.movementDate)}</td>
                  <td className="font-mono" style={{ fontSize: 12 }}>{sku?.skuCode}</td>
                  <td><Badge tone={typeTone(l.movementType)}>{l.movementType.replace("_", " ")}</Badge></td>
                  <td className="tabular" style={{ fontWeight: 700, color: l.quantityChanged < 0 ? "var(--danger)" : "var(--forest)" }}>{l.quantityChanged > 0 ? "+" : ""}{l.quantityChanged}</td>
                  <td className="tabular font-mono">{l.stockAfterChange}</td>
                  <td style={{ fontSize: 12 }}>{user?.fullName || "System"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{l.notes}</td>
                </tr>
              );
            })}
            {logs.length === 0 && <tr><td colSpan={7}><EmptyState icon={History} text="No movements match your filters." /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================ SERVICES ============================ */

function ServiceModal({ service, onClose, onSubmit }) {
  const [serviceName, setServiceName] = useState(service?.serviceName || "");
  const [serviceCategory, setServiceCategory] = useState(service?.serviceCategory || "");
  const [basePrice, setBasePrice] = useState(service?.basePrice ?? "");
  const valid = serviceName.trim() && serviceCategory.trim() && basePrice !== "" && Number(basePrice) >= 0;
  return (
    <Modal title={service ? "Edit Service" : "New Service"} subtitle="Clinical hair transplant procedures & scalp treatments." onClose={onClose} width={440}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ serviceName, serviceCategory, basePrice: Number(basePrice) })}><Check size={14} /> Save Service</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Service Name</label><input className="input focus-ring" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g. FUE Hair Transplant Session" /></div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Category</label><input className="input focus-ring" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} placeholder="e.g. Transplant" /></div>
      <div><label className="field-label">Base Price</label><input type="number" min={0} step="0.01" className="input focus-ring" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" /></div>
    </Modal>
  );
}

function ServicesPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  if (!perms.canRead) return <NoAccessState />;

  const saveService = (payload) => {
    if (editing) { setData((d) => ({ ...d, services: d.services.map((s) => s.serviceId === editing.serviceId ? { ...s, ...payload } : s) })); pushToast(`${payload.serviceName} updated.`); }
    else { setData((d) => ({ ...d, services: [{ serviceId: uid(), isActive: true, ...payload }, ...d.services] })); pushToast(`${payload.serviceName} added to catalog.`); }
    setModalOpen(false); setEditing(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Service Module" title="Services Catalog" subtitle="Master catalog of clinical procedures, scalp treatments & consultations."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={15} /> New Service</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {data.services.map((s) => (
          <div key={s.serviceId} className="card vital-bar-gold" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Badge tone="slate">{s.serviceCategory}</Badge>
              <Toggle on={s.isActive} disabled={!perms.canUpdate} onClick={() => setData((d) => ({ ...d, services: d.services.map((x) => x.serviceId === s.serviceId ? { ...x, isActive: !x.isActive } : x) }))} />
            </div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 8, lineHeight: 1.3 }}>{s.serviceName}</div>
            <div className="font-display tabular" style={{ fontSize: 19, fontWeight: 700, color: "var(--forest)", marginBottom: 10 }}>{fmtMoney(s.basePrice)}</div>
            {perms.canUpdate && <button className="btn btn-secondary btn-sm focus-ring" onClick={() => { setEditing(s); setModalOpen(true); }}><Edit2 size={12} /> Edit</button>}
          </div>
        ))}
      </div>
      {modalOpen && <ServiceModal service={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={saveService} />}
    </div>
  );
}

/* ============================ PATIENT DIRECTORY ============================ */

function PatientModal({ patient, onClose, onSubmit }) {
  const [fullName, setFullName] = useState(patient?.fullName || "");
  const [patientType, setPatientType] = useState(patient?.patientType || "WALK_IN");
  const [phone, setPhone] = useState(patient?.phone || "");
  const [email, setEmail] = useState(patient?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(patient?.dateOfBirth || "");
  const [gender, setGender] = useState(patient?.gender || "Female");
  const [medicalHistory, setMedicalHistory] = useState(patient?.medicalHistory || "");
  const valid = fullName.trim() && phone.trim();
  return (
    <Modal title={patient ? "Edit Patient" : "New Patient"} onClose={onClose} width={520}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!valid} onClick={() => onSubmit({ fullName, patientType, phone, email, dateOfBirth: dateOfBirth || null, gender, medicalHistory })}><Check size={14} /> Save Patient</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Full Name</label><input className="input focus-ring" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">Patient Type</label><select className="select focus-ring" value={patientType} onChange={(e) => setPatientType(e.target.value)}><option value="WALK_IN">Walk-In</option><option value="REGISTERED">Registered</option></select></div>
        <div><label className="field-label">Gender</label><select className="select focus-ring" value={gender} onChange={(e) => setGender(e.target.value)}><option>Female</option><option>Male</option><option>Other</option></select></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label className="field-label">Phone</label><input className="input focus-ring" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className="field-label">Email</label><input type="email" className="input focus-ring" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 12 }}><label className="field-label">Date of Birth</label><input type="date" className="input focus-ring" value={dateOfBirth || ""} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
      <div><label className="field-label">Medical History</label><textarea className="input focus-ring" rows={2} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} placeholder="Allergies, prior conditions…" /></div>
    </Modal>
  );
}

function PatientProfileDrawer({ patient, data, onClose }) {
  const plan = data.patientTreatmentPlans.find((pp) => pp.patientId === patient.patientId && pp.status === "ACTIVE");
  const planTemplate = plan && data.treatmentPlans.find((tp) => tp.planId === plan.planId);
  const invoices = data.invoices.filter((i) => i.patientId === patient.patientId);
  return (
    <Drawer title={patient.fullName} subtitle={`${patient.patientType === "WALK_IN" ? "Walk-in patient" : "Registered patient"} · ${patient.phone}`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ padding: 12 }}><div className="field-label">Date of Birth</div><div style={{ fontWeight: 600, fontSize: 13 }}>{patient.dateOfBirth ? fmtDate(patient.dateOfBirth) : "—"}</div></div>
        <div className="card" style={{ padding: 12 }}><div className="field-label">Gender</div><div style={{ fontWeight: 600, fontSize: 13 }}>{patient.gender || "—"}</div></div>
      </div>
      {patient.medicalHistory && <div className="card" style={{ padding: 12, marginBottom: 18 }}><div className="field-label">Medical History</div><div style={{ fontSize: 12.5 }}>{patient.medicalHistory}</div></div>}
      <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Active Treatment Plan</div>
      {plan ? (
        <div className="card vital-bar" style={{ padding: 14, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{planTemplate?.planName}</span>
            <Badge tone={planTemplate?.planType === "FIXED_PACKAGE" ? "forest" : "slate"}>{planTemplate?.planType.replace("_", " ")}</Badge>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Agreed {fmtMoney(plan.agreedPrice)} · Balance {fmtMoney(plan.balanceRemaining)}</div>
        </div>
      ) : <EmptyState icon={ClipboardList} text="No active treatment plan." />}
      <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Billing History</div>
      <table className="data-table">
        <thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.invoiceId}><td>{inv.invoiceNumber}</td><td>{fmtDate(inv.createdAt)}</td><td className="tabular">{fmtMoney(inv.grandTotal)}</td><td><Badge tone={inv.paymentStatus === "PAID" ? "forest" : "gold"}>{inv.paymentStatus}</Badge></td></tr>
          ))}
          {invoices.length === 0 && <tr><td colSpan={4}><EmptyState icon={Receipt} text="No invoices yet." /></td></tr>}
        </tbody>
      </table>
    </Drawer>
  );
}

function PatientDirectoryPage({ data, setData, perms, pushToast }) {
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profilePatient, setProfilePatient] = useState(null);
  if (!perms.canRead) return <NoAccessState />;

  const filtered = data.patients.filter((p) => (filter === "ALL" || p.patientType === filter) && p.fullName.toLowerCase().includes(query.toLowerCase()));
  const savePatient = (payload) => {
    if (editing) { setData((d) => ({ ...d, patients: d.patients.map((p) => p.patientId === editing.patientId ? { ...p, ...payload } : p) })); pushToast(`${payload.fullName} updated.`); }
    else { setData((d) => ({ ...d, patients: [{ patientId: uid(), createdAt: TODAY, ...payload }, ...d.patients] })); pushToast(`${payload.fullName} registered.`, UserPlus); }
    setModalOpen(false); setEditing(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Patient Module" title="Patient Directory" subtitle="Register and manage patients — walk-in or registered."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => { setEditing(null); setModalOpen(true); }}><UserPlus size={15} /> New Patient</button>} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--muted-2)" }} />
          <input className="input focus-ring" placeholder="Search patients…" style={{ width: 240, paddingLeft: 32 }} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {["ALL", "WALK_IN", "REGISTERED"].map((f) => (
          <button key={f} className={`btn btn-sm focus-ring ${filter === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f)}>{f === "ALL" ? "All" : f === "WALK_IN" ? "Walk-in" : "Registered"}</button>
        ))}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Type</th><th>Contact</th><th>Registered</th><th></th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.patientId}>
                <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                <td><Badge tone={p.patientType === "WALK_IN" ? "slate" : "forest"}>{p.patientType === "WALK_IN" ? "Walk-in" : "Registered"}</Badge></td>
                <td style={{ fontSize: 12.5 }}>{p.phone}</td>
                <td>{fmtDate(p.createdAt)}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setProfilePatient(p)}>View <ChevronRight size={13} /></button>
                  {perms.canUpdate && <button className="btn btn-ghost btn-sm focus-ring" onClick={() => { setEditing(p); setModalOpen(true); }}><Edit2 size={13} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <PatientModal patient={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSubmit={savePatient} />
      )}
      {profilePatient && <PatientProfileDrawer patient={profilePatient} data={data} onClose={() => setProfilePatient(null)} />}
    </div>
  );
}

/* ============================ TREATMENT PLAN MASTER ============================ */

function sessionValue(session, services, skus) {
  const svcSum = session.assignedServices.reduce((s, id) => s + (services.find((x) => x.serviceId === id)?.basePrice || 0), 0);
  const prodSum = session.assignedProducts.reduce((s, p) => s + (skus.find((x) => x.skuId === p.skuId)?.unitPrice || 0) * p.quantity, 0);
  return svcSum + prodSum;
}

function PlanBuilder({ data, onSave, onCancel }) {
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState("PER_VISIT");
  const [numberOfSessions, setNumberOfSessions] = useState(3);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [sessions, setSessions] = useState([{ sessionNumber: 1, sessionTitle: "Session 1", assignedServices: [], assignedProducts: [] }]);

  const resizeSessions = (n) => {
    setSessions((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ sessionNumber: next.length + 1, sessionTitle: `Session ${next.length + 1}`, assignedServices: [], assignedProducts: [] });
      while (next.length > n) next.pop();
      return next;
    });
  };
  const updateSession = (idx, patch) => setSessions((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  const toggleSvc = (idx, svcId) => updateSession(idx, { assignedServices: sessions[idx].assignedServices.includes(svcId) ? sessions[idx].assignedServices.filter((x) => x !== svcId) : [...sessions[idx].assignedServices, svcId] });
  const toggleProd = (idx, skuId) => {
    const cur = sessions[idx].assignedProducts;
    updateSession(idx, { assignedProducts: cur.some((p) => p.skuId === skuId) ? cur.filter((p) => p.skuId !== skuId) : [...cur, { skuId, quantity: 1 }] });
  };
  const calcTotal = sessions.reduce((s, sess) => s + sessionValue(sess, data.services, data.productSkus), 0);

  return (
    <div className="card" style={{ padding: 22, marginBottom: 22 }}>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>New Treatment Plan Template</div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div><label className="field-label">Plan Name</label><input className="input focus-ring" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. FUE Full Restoration Package" /></div>
        <div><label className="field-label">Number of Sessions</label><input type="number" min={1} max={12} className="input focus-ring" value={numberOfSessions} onChange={(e) => { const n = Math.max(1, Math.min(12, Number(e.target.value) || 1)); setNumberOfSessions(n); resizeSessions(n); }} /></div>
        <div><label className="field-label">Frequency</label><select className="select focus-ring" value={frequency} onChange={(e) => setFrequency(e.target.value)}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select></div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="field-label">Plan Type</label>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ v: "FIXED_PACKAGE", d: "Locks items across sessions, price fixed upfront." }, { v: "PER_VISIT", d: "Items editable per session, billed dynamically." }].map((opt) => (
            <div key={opt.v} onClick={() => setPlanType(opt.v)} className="focus-ring" tabIndex={0}
              style={{ flex: 1, padding: "12px 14px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${planType === opt.v ? "var(--forest)" : "var(--border)"}`, background: planType === opt.v ? "var(--forest-tint)" : "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13 }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, border: `2px solid ${planType === opt.v ? "var(--forest)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {planType === opt.v && <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--forest)" }} />}
                </span>
                {opt.v === "FIXED_PACKAGE" ? "Fixed Package" : "Per Visit"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, marginLeft: 22 }}>{opt.d}</div>
            </div>
          ))}
        </div>
      </div>
      {planType === "FIXED_PACKAGE" && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: "var(--gold-tint)", borderRadius: 9, marginBottom: 16, fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 600 }}>
          <Lock size={14} /> Session items locked under Fixed Package rules — configure once on Session 1, replicated to all sessions.
        </div>
      )}
      <div className="field-label" style={{ marginBottom: 8 }}>Session Configuration</div>
      <div className="card" style={{ overflow: "auto", marginBottom: 16 }}>
        <table className="data-table">
          <thead><tr><th>Session #</th><th>Title</th><th style={{ width: 200 }}>Assigned Services</th><th style={{ width: 200 }}>Assigned Products / SKUs</th><th>Calculated Value</th><th></th></tr></thead>
          <tbody>
            {sessions.map((session, idx) => {
              const locked = planType === "FIXED_PACKAGE" && idx > 0;
              const effSession = locked ? { ...sessions[0], sessionNumber: session.sessionNumber, sessionTitle: session.sessionTitle } : session;
              const val = sessionValue(effSession, data.services, data.productSkus);
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{session.sessionNumber}</td>
                  <td><input className="input focus-ring" style={{ width: 140 }} value={session.sessionTitle} onChange={(e) => updateSession(idx, { sessionTitle: e.target.value })} /></td>
                  <td>
                    <SvcMultiSelect disabled={locked} services={data.services.filter((s) => s.isActive)} selectedIds={effSession.assignedServices} onToggle={(id) => toggleSvc(locked ? 0 : idx, id)} />
                  </td>
                  <td>
                    <ProdMultiSelect disabled={locked} skus={data.productSkus} selectedIds={effSession.assignedProducts.map((p) => p.skuId)} onToggle={(id) => toggleProd(locked ? 0 : idx, id)} />
                  </td>
                  <td className="tabular" style={{ fontWeight: 700, color: "var(--forest)" }}>{fmtMoney(val)}</td>
                  <td>{locked && <Lock size={14} color="var(--muted-2)" />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Calculated total across all sessions: <span className="tabular" style={{ fontWeight: 700, color: "var(--ink)" }}>{fmtMoney(calcTotal)}</span></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary focus-ring" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary focus-ring" disabled={!planName}
            onClick={() => onSave({
              planId: uid(), planName, planType, numberOfSessions, frequency, totalPrice: calcTotal,
              sessions: (planType === "FIXED_PACKAGE" ? sessions.map((s) => ({ ...sessions[0], sessionId: uid(), sessionNumber: s.sessionNumber, sessionTitle: s.sessionTitle })) : sessions.map((s) => ({ ...s, sessionId: uid() }))),
            })}>
            <Check size={14} /> Save Plan Template
          </button>
        </div>
      </div>
    </div>
  );
}

function SvcMultiSelect({ services, selectedIds, onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" disabled={disabled} className="btn btn-secondary btn-sm focus-ring" style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setOpen((o) => !o)}>
        <span>{selectedIds.length ? `${selectedIds.length} service${selectedIds.length > 1 ? "s" : ""}` : "Select services"}</span><ChevronDown size={13} />
      </button>
      {open && !disabled && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div className="card" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, width: 240, maxHeight: 220, overflowY: "auto", padding: 6, boxShadow: "0 10px 26px rgba(20,20,15,.16)" }}>
            {services.map((s) => (
              <div key={s.serviceId} onClick={() => onToggle(s.serviceId)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 7, cursor: "pointer", fontSize: 12.5 }}>
                <Checkbox checked={selectedIds.includes(s.serviceId)} onChange={() => onToggle(s.serviceId)} /><span>{s.serviceName}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
function ProdMultiSelect({ skus, selectedIds, onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" disabled={disabled} className="btn btn-secondary btn-sm focus-ring" style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setOpen((o) => !o)}>
        <span>{selectedIds.length ? `${selectedIds.length} product${selectedIds.length > 1 ? "s" : ""}` : "Select products"}</span><ChevronDown size={13} />
      </button>
      {open && !disabled && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div className="card" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, width: 240, maxHeight: 220, overflowY: "auto", padding: 6, boxShadow: "0 10px 26px rgba(20,20,15,.16)" }}>
            {skus.map((s) => (
              <div key={s.skuId} onClick={() => onToggle(s.skuId)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 7, cursor: "pointer", fontSize: 12.5 }}>
                <Checkbox checked={selectedIds.includes(s.skuId)} onChange={() => onToggle(s.skuId)} /><span>{s.skuCode}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TreatmentPlanMasterPage({ data, setData, perms, pushToast }) {
  const [building, setBuilding] = useState(false);
  if (!perms.canRead) return <NoAccessState />;
  return (
    <div>
      <PageHeader eyebrow="Patient Module" title="Treatment Plan Master" subtitle="Build reusable plan templates with sessions, frequency and pricing rules."
        action={!building && perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setBuilding(true)}><Plus size={15} /> New Plan Template</button>} />
      {building && <PlanBuilder data={data} onCancel={() => setBuilding(false)} onSave={(plan) => { setData((d) => ({ ...d, treatmentPlans: [plan, ...d.treatmentPlans] })); pushToast(`Plan template "${plan.planName}" created.`); setBuilding(false); }} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {data.treatmentPlans.map((plan) => (
          <div key={plan.planId} className={`card ${plan.planType === "FIXED_PACKAGE" ? "vital-bar" : "vital-bar-gold"}`} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>{plan.planName}</div>
              <Badge tone={plan.planType === "FIXED_PACKAGE" ? "forest" : "gold"} icon={plan.planType === "FIXED_PACKAGE" ? Lock : Edit2}>{plan.planType === "FIXED_PACKAGE" ? "Fixed Package" : "Per Visit"}</Badge>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
              <span><CalendarCheck2 size={12} style={{ verticalAlign: -2 }} /> {plan.numberOfSessions} sessions</span><span>{plan.frequency.toLowerCase()}</span>
            </div>
            <div className="font-display tabular" style={{ fontSize: 20, fontWeight: 700, color: "var(--forest)", marginBottom: 12 }}>{fmtMoney(plan.totalPrice)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {plan.sessions.map((s) => (
                <div key={s.sessionNumber} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "6px 9px", background: "var(--surface-alt)", borderRadius: 7 }}>
                  <span>{s.sessionTitle}</span><span className="tabular" style={{ fontWeight: 600 }}>{fmtMoney(sessionValue(s, data.services, data.productSkus))}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ ACTIVE PATIENT PLANS ============================ */

function AssignPlanModal({ data, onClose, onSubmit }) {
  const registered = data.patients.filter((p) => p.patientType === "REGISTERED");
  const [patientId, setPatientId] = useState(registered[0]?.patientId);
  const [planId, setPlanId] = useState(data.treatmentPlans[0]?.planId);
  const [startDate, setStartDate] = useState(TODAY);
  const alreadyActive = data.patientTreatmentPlans.some((pp) => pp.patientId === Number(patientId) && pp.status === "ACTIVE");
  const plan = data.treatmentPlans.find((p) => p.planId === Number(planId));

  return (
    <Modal title="Assign Treatment Plan" subtitle="Each patient may only hold one ACTIVE plan at a time." onClose={onClose} width={480}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={alreadyActive} onClick={() => onSubmit({ patientId: Number(patientId), planId: Number(planId), startDate, agreedPrice: plan.totalPrice })}><ClipboardSignature size={14} /> Assign Plan</button></>}>
      <div style={{ marginBottom: 12 }}><label className="field-label">Patient</label>
        <select className="select focus-ring" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          {registered.map((p) => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
        </select>
      </div>
      {alreadyActive && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--danger-tint)", borderRadius: 8, marginBottom: 12, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>
          <AlertTriangle size={14} /> This patient already has an ACTIVE plan. Complete or cancel it first.
        </div>
      )}
      <div style={{ marginBottom: 12 }}><label className="field-label">Plan Template</label>
        <select className="select focus-ring" value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {data.treatmentPlans.map((p) => <option key={p.planId} value={p.planId}>{p.planName} — {fmtMoney(p.totalPrice)}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}><label className="field-label">Start Date</label><input type="date" className="input focus-ring" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
      {plan && (
        <div style={{ padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 9, fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--muted)" }}>Agreed price</span><span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(plan.totalPrice)}</span>
        </div>
      )}
    </Modal>
  );
}

function CyclesDrawer({ patientPlan, data, setData, onClose, pushToast }) {
  const plan = data.treatmentPlans.find((p) => p.planId === patientPlan.planId);
  const patient = data.patients.find((p) => p.patientId === patientPlan.patientId);
  const cycles = data.planCycles.filter((c) => c.patientPlanId === patientPlan.patientPlanId).sort((a, b) => a.cycleNumber - b.cycleNumber);
  const markComplete = (cycle) => {
    setData((d) => ({ ...d, planCycles: d.planCycles.map((c) => c.cycleId === cycle.cycleId ? { ...c, status: "COMPLETED", executionDate: TODAY } : c) }));
    pushToast(`Cycle ${cycle.cycleNumber} marked completed. Bill it from Billing & Invoices.`, CalendarCheck2);
  };
  return (
    <Drawer title={`${patient?.fullName} — Cycles`} subtitle={plan?.planName} onClose={onClose}>
      <div className="timeline">
        {cycles.map((c) => {
          const session = plan?.sessions.find((s) => s.sessionId === c.sessionId);
          return (
            <div key={c.cycleId} className="timeline-item">
              <div className={`timeline-dot ${c.status === "PENDING" ? "" : ""}`}>{c.status === "COMPLETED" ? <Check size={9} color="var(--forest)" /> : <CalendarCheck2 size={9} color="var(--gold-dark)" />}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>Cycle {c.cycleNumber} — {session?.sessionTitle}</span>
                <Badge tone={c.status === "COMPLETED" ? "forest" : "gold"}>{c.status}</Badge>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>Scheduled {fmtDate(c.scheduledDate)}{c.executionDate ? ` · Executed ${fmtDate(c.executionDate)}` : ""}</div>
              {c.status === "PENDING" && <button className="btn btn-secondary btn-sm focus-ring" onClick={() => markComplete(c)}><Check size={12} /> Mark Complete</button>}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}

function ActivePatientPlansPage({ data, setData, perms, pushToast }) {
  const [assignModal, setAssignModal] = useState(false);
  const [cyclesFor, setCyclesFor] = useState(null);
  if (!perms.canRead) return <NoAccessState />;

  const assignPlan = ({ patientId, planId, startDate, agreedPrice }) => {
    const plan = data.treatmentPlans.find((p) => p.planId === planId);
    const patientPlanId = uid();
    const newCycles = plan.sessions.map((s) => ({
      cycleId: uid(), patientPlanId, sessionId: s.sessionId, cycleNumber: s.sessionNumber,
      scheduledDate: computeScheduledDate(startDate, plan.frequency, s.sessionNumber), executionDate: null, status: "PENDING", notes: "",
    }));
    setData((d) => ({
      ...d,
      patientTreatmentPlans: [{ patientPlanId, patientId, planId, agreedPrice, balanceRemaining: agreedPrice, status: "ACTIVE", startDate }, ...d.patientTreatmentPlans],
      planCycles: [...newCycles, ...d.planCycles],
    }));
    pushToast("Treatment plan assigned and cycles scheduled.", ClipboardSignature);
    setAssignModal(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Patient Module" title="Active Patient Plans" subtitle="Plans assigned to registered patients, with cycle tracking and one-active-plan enforcement."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setAssignModal(true)}><Plus size={15} /> Assign Plan</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Plan</th><th>Type</th><th>Progress</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.patientTreatmentPlans.map((pp) => {
              const patient = data.patients.find((p) => p.patientId === pp.patientId);
              const planTemplate = data.treatmentPlans.find((p) => p.planId === pp.planId);
              const cycles = data.planCycles.filter((c) => c.patientPlanId === pp.patientPlanId);
              const completed = cycles.filter((c) => c.status === "COMPLETED").length;
              return (
                <tr key={pp.patientPlanId}>
                  <td style={{ fontWeight: 600 }}>{patient?.fullName}</td>
                  <td>{planTemplate?.planName}</td>
                  <td><Badge tone={planTemplate?.planType === "FIXED_PACKAGE" ? "forest" : "slate"}>{planTemplate?.planType.replace("_", " ")}</Badge></td>
                  <td style={{ minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Bar pct={(completed / cycles.length) * 100} color="var(--forest)" />
                      <span className="tabular" style={{ fontSize: 11.5 }}>{completed}/{cycles.length}</span>
                    </div>
                  </td>
                  <td className="tabular" style={{ fontWeight: 700, color: pp.balanceRemaining > 0 ? "var(--danger)" : "var(--forest)" }}>{fmtMoney(pp.balanceRemaining)}</td>
                  <td><Badge tone={pp.status === "ACTIVE" ? "forest" : "slate"}>{pp.status}</Badge></td>
                  <td><button className="btn btn-ghost btn-sm focus-ring" onClick={() => setCyclesFor(pp)}><CalendarCheck2 size={13} /> Cycles</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {assignModal && <AssignPlanModal data={data} onClose={() => setAssignModal(false)} onSubmit={assignPlan} />}
      {cyclesFor && <CyclesDrawer patientPlan={cyclesFor} data={data} setData={setData} onClose={() => setCyclesFor(null)} pushToast={pushToast} />}
    </div>
  );
}

/* ============================ BILLING & INVOICES ============================ */

function activeDiscountFor(discounts) {
  return discounts.find((d) => d.isActive && new Date(TODAY) >= new Date(d.startDate) && new Date(TODAY) <= new Date(d.endDate));
}

function WalkinCheckoutModal({ data, onClose, onSubmit }) {
  const [patientId, setPatientId] = useState(data.patients[0]?.patientId);
  const [serviceIds, setServiceIds] = useState([]);
  const [productSel, setProductSel] = useState([]);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const matchingAccounts = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[paymentMethod]);
  const [accountId, setAccountId] = useState(matchingAccounts[0]?.accountId);

  const activeDiscount = activeDiscountFor(data.discountConfigurations);
  const serviceSum = serviceIds.reduce((s, id) => s + (data.services.find((x) => x.serviceId === id)?.basePrice || 0), 0);
  const productSum = productSel.reduce((s, p) => s + (data.productSkus.find((x) => x.skuId === p.skuId)?.unitPrice || 0) * p.qty, 0);
  const subTotal = serviceSum + productSum;
  const systemDiscountAmt = activeDiscount ? (activeDiscount.discountType === "PERCENTAGE" ? subTotal * (activeDiscount.value / 100) : activeDiscount.value) : 0;
  const effectiveDiscount = manualDiscount > 0 ? Number(manualDiscount) : systemDiscountAmt;
  const taxable = Math.max(0, subTotal - effectiveDiscount);
  const taxAmount = taxable * (data.clinicSettings.vatRate / 100);
  const grandTotal = taxable + taxAmount;

  const toggleService = (id) => setServiceIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleProduct = (id) => setProductSel((s) => s.some((p) => p.skuId === id) ? s.filter((p) => p.skuId !== id) : [...s, { skuId: id, qty: 1 }]);
  const setQty = (id, qty) => setProductSel((s) => s.map((p) => p.skuId === id ? { ...p, qty: Math.max(1, qty) } : p));
  const handleMethodChange = (m) => {
    setPaymentMethod(m);
    const next = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[m]);
    setAccountId(next[0]?.accountId);
  };

  return (
    <Modal title="Walk-in Quick Checkout" subtitle="Mix services and OTC products into a single invoice." onClose={onClose} width={720}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={subTotal === 0 || !accountId} onClick={() => onSubmit({ patientId: Number(patientId), serviceIds, productSel, subTotal, discount: effectiveDiscount, taxAmount, grandTotal, accountId: Number(accountId), paymentMethod, channel: "WALK_IN" })}><Receipt size={14} /> Generate Invoice</button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div><label className="field-label">Patient</label><select className="select focus-ring" value={patientId} onChange={(e) => setPatientId(e.target.value)}>{data.patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.fullName} · {p.patientType}</option>)}</select></div>
        <div>
          <label className="field-label">Services</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.services.filter((s) => s.isActive).map((s) => (
              <div key={s.serviceId} onClick={() => toggleService(s.serviceId)} className="focus-ring" tabIndex={0}
                style={{ cursor: "pointer", padding: "8px 12px", borderRadius: 9, border: `1.5px solid ${serviceIds.includes(s.serviceId) ? "var(--forest)" : "var(--border)"}`, background: serviceIds.includes(s.serviceId) ? "var(--forest-tint)" : "var(--surface)", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8 }}>
                <Checkbox checked={serviceIds.includes(s.serviceId)} onChange={() => toggleService(s.serviceId)} /><span style={{ fontWeight: 600 }}>{s.serviceName}</span><span className="tabular" style={{ color: "var(--muted)" }}>{fmtMoney(s.basePrice)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">OTC Products</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.productSkus.map((sk) => {
              const sel = productSel.find((p) => p.skuId === sk.skuId);
              return (
                <div key={sk.skuId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: sel ? "var(--forest-tint)" : "var(--surface-alt)", border: "1px solid var(--border-soft)" }}>
                  <Checkbox checked={!!sel} onChange={() => toggleProduct(sk.skuId)} />
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{sk.skuCode} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {fmtMoney(sk.unitPrice)}</span></div>
                  {sel && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setQty(sk.skuId, sel.qty - 1)}><MinusCircle size={14} /></button>
                      <span className="tabular" style={{ width: 18, textAlign: "center", fontSize: 12.5 }}>{sel.qty}</span>
                      <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setQty(sk.skuId, sel.qty + 1)}><PlusCircle size={14} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="field-label">Payment Method</label>
            <select className="select focus-ring" value={paymentMethod} onChange={(e) => handleMethodChange(e.target.value)}>
              {Object.keys(PAYMENT_METHOD_LABELS).filter((m) => m !== "CHEQUE").map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
            </select>
          </div>
          <div><label className="field-label">Collect Into Account</label>
            {matchingAccounts.length === 0 ? (
              <div style={{ fontSize: 11.5, color: "var(--danger)", padding: "8px 10px", background: "var(--danger-tint)", borderRadius: 7 }}>No active account for this method.</div>
            ) : (
              <select className="select focus-ring" value={accountId} onChange={(e) => setAccountId(e.target.value)}>{matchingAccounts.map((a) => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}</select>
            )}
          </div>
        </div>
        <div className="card" style={{ padding: 16, background: "var(--surface-alt)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>Subtotal</span><span className="tabular" style={{ fontWeight: 600 }}>{fmtMoney(subTotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: "var(--muted)" }}>{activeDiscount ? <>System discount <Badge tone="gold">{activeDiscount.discountCode}</Badge></> : "Manual discount"}</span>
            {activeDiscount && manualDiscount == 0 ? <span className="tabular" style={{ fontWeight: 600, color: "var(--forest)" }}>-{fmtMoney(systemDiscountAmt)}</span> : <input type="number" min="0" className="input focus-ring" style={{ width: 90, textAlign: "right" }} value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} placeholder="0.00" />}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>VAT ({data.clinicSettings.vatRate}%)</span><span className="tabular">{fmtMoney(taxAmount)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15.5, paddingTop: 10, borderTop: "1px dashed var(--border)" }}><span className="font-display" style={{ fontWeight: 700 }}>Grand Total</span><span className="font-display tabular" style={{ fontWeight: 700, color: "var(--forest)" }}>{fmtMoney(grandTotal)}</span></div>
        </div>
      </div>
    </Modal>
  );
}

function CycleCheckoutModal({ data, onClose, onSubmit }) {
  const eligiblePlans = data.patientTreatmentPlans.filter((pp) => pp.status === "ACTIVE" && data.planCycles.some((c) => c.patientPlanId === pp.patientPlanId && c.status === "COMPLETED" && !data.invoices.some((i) => i.cycleId === c.cycleId)));
  const [patientPlanId, setPatientPlanId] = useState(eligiblePlans[0]?.patientPlanId);
  const pp = data.patientTreatmentPlans.find((x) => x.patientPlanId === Number(patientPlanId));
  const planTemplate = pp && data.treatmentPlans.find((t) => t.planId === pp.planId);
  const billableCycles = pp ? data.planCycles.filter((c) => c.patientPlanId === pp.patientPlanId && c.status === "COMPLETED" && !data.invoices.some((i) => i.cycleId === c.cycleId)) : [];
  const [cycleId, setCycleId] = useState(billableCycles[0]?.cycleId);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const matchingAccounts = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[paymentMethod]);
  const [accountId, setAccountId] = useState(matchingAccounts[0]?.accountId);
  const handleMethodChange = (m) => {
    setPaymentMethod(m);
    const next = data.accountSetups.filter((a) => a.isActive && a.accountType === PAYMENT_METHOD_ACCOUNT_TYPE[m]);
    setAccountId(next[0]?.accountId);
  };

  const cycle = data.planCycles.find((c) => c.cycleId === Number(cycleId));
  const session = planTemplate?.sessions.find((s) => s.sessionId === cycle?.sessionId);
  const subTotal = planTemplate ? (planTemplate.planType === "FIXED_PACKAGE" ? planTemplate.totalPrice / planTemplate.numberOfSessions : session ? sessionValue(session, data.services, data.productSkus) : 0) : 0;
  const taxAmount = subTotal * (data.clinicSettings.vatRate / 100);
  const grandTotal = subTotal + taxAmount;

  return (
    <Modal title="Cycle Visit Checkout" subtitle="Bill a completed treatment cycle for an active patient plan." onClose={onClose} width={560}
      footer={<><button className="btn btn-secondary focus-ring" onClick={onClose}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!cycle || !accountId} onClick={() => onSubmit({ patientId: pp.patientId, patientPlanId: pp.patientPlanId, cycleId: cycle.cycleId, session, subTotal, taxAmount, grandTotal, accountId: Number(accountId), paymentMethod, channel: "CYCLE" })}><Receipt size={14} /> Generate Invoice</button></>}>
      {eligiblePlans.length === 0 ? <EmptyState icon={CalendarCheck2} text="No completed, unbilled cycles right now." /> : (
        <>
          <div style={{ marginBottom: 12 }}><label className="field-label">Patient Plan</label>
            <select className="select focus-ring" value={patientPlanId} onChange={(e) => { setPatientPlanId(e.target.value); }}>
              {eligiblePlans.map((p) => <option key={p.patientPlanId} value={p.patientPlanId}>{data.patients.find((pt) => pt.patientId === p.patientId)?.fullName} — {data.treatmentPlans.find((t) => t.planId === p.planId)?.planName}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label className="field-label">Cycle to Bill</label>
            <select className="select focus-ring" value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
              {billableCycles.map((c) => <option key={c.cycleId} value={c.cycleId}>Cycle {c.cycleNumber} — {planTemplate?.sessions.find((s) => s.sessionId === c.sessionId)?.sessionTitle}</option>)}
            </select>
          </div>
          {session && (
            <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--surface-alt)" }}>
              <div className="field-label">Session Includes</div>
              <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 3 }}>
                {session.assignedServices.map((sid) => <span key={sid}>• {data.services.find((s) => s.serviceId === sid)?.serviceName}</span>)}
                {session.assignedProducts.map((p) => <span key={p.skuId}>• {data.productSkus.find((s) => s.skuId === p.skuId)?.skuCode} × {p.quantity}</span>)}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><label className="field-label">Payment Method</label>
              <select className="select focus-ring" value={paymentMethod} onChange={(e) => handleMethodChange(e.target.value)}>
                {Object.keys(PAYMENT_METHOD_LABELS).filter((m) => m !== "CHEQUE").map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
              </select>
            </div>
            <div><label className="field-label">Collect Into Account</label>
              {matchingAccounts.length === 0 ? (
                <div style={{ fontSize: 11.5, color: "var(--danger)", padding: "8px 10px", background: "var(--danger-tint)", borderRadius: 7 }}>No active account for this method.</div>
              ) : (
                <select className="select focus-ring" value={accountId} onChange={(e) => setAccountId(e.target.value)}>{matchingAccounts.map((a) => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}</select>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 14, background: "var(--surface-alt)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: "var(--muted)" }}>Installment / Session Value</span><span className="tabular">{fmtMoney(subTotal)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: "var(--muted)" }}>VAT ({data.clinicSettings.vatRate}%)</span><span className="tabular">{fmtMoney(taxAmount)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, paddingTop: 8, borderTop: "1px dashed var(--border)" }}><span className="font-display" style={{ fontWeight: 700 }}>Grand Total</span><span className="font-display tabular" style={{ fontWeight: 700, color: "var(--forest)" }}>{fmtMoney(grandTotal)}</span></div>
          </div>
        </>
      )}
    </Modal>
  );
}

function BillingInvoicesPage({ data, setData, perms, pushToast }) {
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  if (!perms.canRead) return <NoAccessState />;

  const nextInvoiceNumber = () => `VERA-INV-${1039 + data.invoices.length + 1}`;

  const submitWalkin = (payload) => {
    const invoiceId = uid();
    const invoiceNumber = nextInvoiceNumber();
    setData((d) => {
      let skus = d.productSkus.map((s) => ({ ...s }));
      const newLogs = [];
      payload.productSel.forEach((p) => {
        const sku = skus.find((s) => s.skuId === p.skuId);
        sku.currentStock = Math.max(0, sku.currentStock - p.qty);
        newLogs.push({ movementId: uid(), skuId: p.skuId, movementType: "DIRECT_SALE", referenceId: invoiceId, quantityChanged: -p.qty, stockAfterChange: sku.currentStock, performedByUserId: 2, movementDate: new Date().toISOString(), notes: `Sold on Invoice ${invoiceNumber}` });
      });
      return {
        ...d, productSkus: skus, stockMovementLogs: [...newLogs, ...d.stockMovementLogs],
        invoices: [{ invoiceId, invoiceNumber, patientId: payload.patientId, patientPlanId: null, cycleId: null, subTotal: payload.subTotal, discountId: null, manualDiscount: payload.discount, taxAmount: payload.taxAmount, grandTotal: payload.grandTotal, paymentStatus: "PAID", channel: "WALK_IN", createdAt: TODAY }, ...d.invoices],
        invoiceServices: [...payload.serviceIds.map((sid) => ({ invoiceServiceId: uid(), invoiceId, serviceId: sid, unitPrice: data.services.find((s) => s.serviceId === sid)?.basePrice || 0 })), ...d.invoiceServices],
        invoiceProducts: [...payload.productSel.map((p) => ({ invoiceProductId: uid(), invoiceId, skuId: p.skuId, quantity: p.qty, unitPrice: data.productSkus.find((s) => s.skuId === p.skuId)?.unitPrice || 0 })), ...d.invoiceProducts],
        patientPayments: [{ paymentId: uid(), invoiceId, accountId: payload.accountId, amountPaid: payload.grandTotal, paymentMethod: payload.paymentMethod, paymentDate: TODAY, receivedByUserId: 2 }, ...d.patientPayments],
        accountSetups: d.accountSetups.map((a) => a.accountId === payload.accountId ? { ...a, currentBalance: a.currentBalance + payload.grandTotal } : a),
      };
    });
    pushToast(`Invoice ${invoiceNumber} generated for ${fmtMoney(payload.grandTotal)}.`, Receipt);
    setWalkinOpen(false);
  };

  const submitCycle = (payload) => {
    const invoiceId = uid();
    const invoiceNumber = nextInvoiceNumber();
    setData((d) => ({
      ...d,
      invoices: [{ invoiceId, invoiceNumber, patientId: payload.patientId, patientPlanId: payload.patientPlanId, cycleId: payload.cycleId, subTotal: payload.subTotal, discountId: null, manualDiscount: 0, taxAmount: payload.taxAmount, grandTotal: payload.grandTotal, paymentStatus: "PAID", channel: "CYCLE", createdAt: TODAY }, ...d.invoices],
      invoiceServices: [...(payload.session?.assignedServices || []).map((sid) => ({ invoiceServiceId: uid(), invoiceId, serviceId: sid, unitPrice: data.services.find((s) => s.serviceId === sid)?.basePrice || 0 })), ...d.invoiceServices],
      patientPayments: [{ paymentId: uid(), invoiceId, accountId: payload.accountId, amountPaid: payload.grandTotal, paymentMethod: payload.paymentMethod, paymentDate: TODAY, receivedByUserId: 1 }, ...d.patientPayments],
      accountSetups: d.accountSetups.map((a) => a.accountId === payload.accountId ? { ...a, currentBalance: a.currentBalance + payload.grandTotal } : a),
      patientTreatmentPlans: d.patientTreatmentPlans.map((pp) => pp.patientPlanId === payload.patientPlanId ? { ...pp, balanceRemaining: Math.max(0, pp.balanceRemaining - payload.subTotal) } : pp),
    }));
    pushToast(`Invoice ${invoiceNumber} generated for ${fmtMoney(payload.grandTotal)}.`, Receipt);
    setCycleOpen(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Patient Module" title="Billing & Invoices" subtitle="Walk-in quick checkout and cycle visit checkout, with dynamic discounts and account routing."
        action={perms.canCreate && <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary focus-ring" onClick={() => setCycleOpen(true)}><CalendarCheck2 size={15} /> Cycle Visit Checkout</button>
          <button className="btn btn-primary focus-ring" onClick={() => setWalkinOpen(true)}><Plus size={15} /> Walk-in Checkout</button>
        </div>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Patient</th><th>Channel</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data.invoices.map((inv) => (
              <tr key={inv.invoiceId}>
                <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                <td>{data.patients.find((p) => p.patientId === inv.patientId)?.fullName}</td>
                <td><Badge tone={inv.channel === "CYCLE" ? "forest" : "slate"}>{inv.channel}</Badge></td>
                <td className="tabular">{fmtMoney(inv.subTotal)}</td>
                <td className="tabular" style={{ color: "var(--muted)" }}>{fmtMoney(inv.taxAmount)}</td>
                <td className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(inv.grandTotal)}</td>
                <td><Badge tone={inv.paymentStatus === "PAID" ? "forest" : "gold"}>{inv.paymentStatus}</Badge></td>
                <td>{fmtDate(inv.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {walkinOpen && <WalkinCheckoutModal data={data} onClose={() => setWalkinOpen(false)} onSubmit={submitWalkin} />}
      {cycleOpen && <CycleCheckoutModal data={data} onClose={() => setCycleOpen(false)} onSubmit={submitCycle} />}
    </div>
  );
}

/* ============================ EXPENSE MODULE ============================ */

function ExpenseCategoriesPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  if (!perms.canRead) return <NoAccessState />;
  return (
    <div>
      <PageHeader eyebrow="Expense Module" title="Expense Categories" subtitle="Categories for operational overhead."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Plus size={15} /> New Category</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table"><thead><tr><th>Category</th><th>Description</th></tr></thead>
          <tbody>{data.expenseCategories.map((c) => <tr key={c.categoryId}><td style={{ fontWeight: 600 }}>{c.categoryName}</td><td style={{ color: "var(--muted)" }}>{c.description}</td></tr>)}</tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title="New Expense Category" onClose={() => setModalOpen(false)} width={420}
          footer={<><button className="btn btn-secondary focus-ring" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!name.trim()} onClick={() => { setData((d) => ({ ...d, expenseCategories: [{ categoryId: uid(), categoryName: name, description: desc }, ...d.expenseCategories] })); pushToast(`Category "${name}" created.`); setModalOpen(false); setName(""); setDesc(""); }}><Check size={14} /> Save</button></>}>
          <div style={{ marginBottom: 12 }}><label className="field-label">Category Name</label><input className="input focus-ring" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="field-label">Description</label><input className="input focus-ring" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        </Modal>
      )}
    </div>
  );
}

function SetupExpensesPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: data.expenseCategories[0]?.categoryId, title: "", defaultAmount: "", recurringFrequency: "MONTHLY" });
  if (!perms.canRead) return <NoAccessState />;
  return (
    <div>
      <PageHeader eyebrow="Expense Module" title="Setup Expenses" subtitle="Recurring monthly or quarterly overhead templates."
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Plus size={15} /> New Setup Expense</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table"><thead><tr><th>Title</th><th>Category</th><th>Default Amount</th><th>Frequency</th></tr></thead>
          <tbody>{data.setupExpenses.map((s) => (
            <tr key={s.setupExpenseId}>
              <td style={{ fontWeight: 600 }}>{s.title}</td>
              <td><Badge tone="slate">{data.expenseCategories.find((c) => c.categoryId === s.categoryId)?.categoryName}</Badge></td>
              <td className="tabular">{fmtMoney(s.defaultAmount)}</td>
              <td><Badge tone="gold" icon={Repeat}>{s.recurringFrequency}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title="New Setup Expense" onClose={() => setModalOpen(false)} width={460}
          footer={<><button className="btn btn-secondary focus-ring" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!form.title.trim() || !form.defaultAmount} onClick={() => { setData((d) => ({ ...d, setupExpenses: [{ setupExpenseId: uid(), categoryId: Number(form.categoryId), title: form.title, defaultAmount: Number(form.defaultAmount), recurringFrequency: form.recurringFrequency }, ...d.setupExpenses] })); pushToast(`"${form.title}" added.`); setModalOpen(false); }}><Check size={14} /> Save</button></>}>
          <div style={{ marginBottom: 12 }}><label className="field-label">Title</label><input className="input focus-ring" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Clinic Lease" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="field-label">Category</label><select className="select focus-ring" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>{data.expenseCategories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
            <div><label className="field-label">Default Amount</label><input type="number" step="0.01" className="input focus-ring" value={form.defaultAmount} onChange={(e) => setForm((f) => ({ ...f, defaultAmount: e.target.value }))} /></div>
          </div>
          <div><label className="field-label">Recurring Frequency</label><select className="select focus-ring" value={form.recurringFrequency} onChange={(e) => setForm((f) => ({ ...f, recurringFrequency: e.target.value }))}><option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option></select></div>
        </Modal>
      )}
    </div>
  );
}

function BudgetEstimatesPage({ data, setData, perms, pushToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: data.expenseCategories[0]?.categoryId, month: 7, year: 2026, budgetedAmount: "" });
  if (!perms.canRead) return <NoAccessState />;

  const rows = data.expenseCategories.map((cat) => {
    const budget = data.expenseBudgetEstimates.find((b) => b.categoryId === cat.categoryId && b.month === 7 && b.year === 2026);
    const actual = data.expenseEntries.filter((e) => e.categoryId === cat.categoryId && new Date(e.expenseDate).getMonth() + 1 === 7 && new Date(e.expenseDate).getFullYear() === 2026).reduce((s, e) => s + e.amount, 0);
    const budgeted = budget?.budgetedAmount || 0;
    const variance = budgeted - actual;
    return { cat, budgeted, actual, variance };
  });

  return (
    <div>
      <PageHeader eyebrow="Expense Module" title="Expense Budget Estimates" subtitle={`Budget vs. actual for ${MONTH_NAMES[6]} 2026, by category.`}
        action={perms.canCreate && <button className="btn btn-primary focus-ring" onClick={() => setModalOpen(true)}><Plus size={15} /> Set Budget</button>} />
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Category</th><th>Budgeted</th><th>Actual</th><th>Variance</th><th>Usage</th></tr></thead>
          <tbody>
            {rows.map(({ cat, budgeted, actual, variance }) => (
              <tr key={cat.categoryId}>
                <td style={{ fontWeight: 600 }}>{cat.categoryName}</td>
                <td className="tabular">{fmtMoney(budgeted)}</td>
                <td className="tabular">{fmtMoney(actual)}</td>
                <td className="tabular" style={{ fontWeight: 700, color: variance >= 0 ? "var(--forest)" : "var(--danger)" }}>
                  {variance >= 0 ? <TrendingDown size={12} style={{ verticalAlign: -1 }} /> : <TrendingUp size={12} style={{ verticalAlign: -1 }} />} {fmtMoney(Math.abs(variance))} {variance >= 0 ? "under" : "over"}
                </td>
                <td style={{ minWidth: 130 }}><Bar pct={budgeted ? (actual / budgeted) * 100 : 0} color={actual > budgeted ? "var(--danger)" : "var(--forest)"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title="Set Budget Estimate" onClose={() => setModalOpen(false)} width={440}
          footer={<><button className="btn btn-secondary focus-ring" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary focus-ring" disabled={!form.budgetedAmount} onClick={() => { setData((d) => ({ ...d, expenseBudgetEstimates: [{ budgetId: uid(), categoryId: Number(form.categoryId), month: Number(form.month), year: Number(form.year), budgetedAmount: Number(form.budgetedAmount) }, ...d.expenseBudgetEstimates.filter((b) => !(b.categoryId === Number(form.categoryId) && b.month === Number(form.month) && b.year === Number(form.year)))] })); pushToast("Budget estimate saved."); setModalOpen(false); }}><Check size={14} /> Save Budget</button></>}>
          <div style={{ marginBottom: 12 }}><label className="field-label">Category</label><select className="select focus-ring" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>{data.expenseCategories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="field-label">Month</label><select className="select focus-ring" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></div>
            <div><label className="field-label">Year</label><input type="number" className="input focus-ring" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} /></div>
          </div>
          <div><label className="field-label">Budgeted Amount</label><input type="number" step="0.01" className="input focus-ring" value={form.budgetedAmount} onChange={(e) => setForm((f) => ({ ...f, budgetedAmount: e.target.value }))} /></div>
        </Modal>
      )}
    </div>
  );
}

function ExpenseEntriesPage({ data, setData, perms, pushToast }) {
  const [form, setForm] = useState({ categoryId: data.expenseCategories[0]?.categoryId, accountId: data.accountSetups[0]?.accountId, title: "", amount: "", vendorName: "", notes: "" });
  if (!perms.canRead) return <NoAccessState />;

  const addEntry = () => {
    if (!form.title.trim() || !form.amount) return;
    setData((d) => ({
      ...d,
      expenseEntries: [{ expenseId: uid(), categoryId: Number(form.categoryId), accountId: Number(form.accountId), title: form.title, amount: Number(form.amount), expenseDate: TODAY, vendorName: form.vendorName, loggedByUserId: 1, notes: form.notes }, ...d.expenseEntries],
      accountSetups: d.accountSetups.map((a) => a.accountId === Number(form.accountId) ? { ...a, currentBalance: a.currentBalance - Number(form.amount) } : a),
    }));
    pushToast(`Expense "${form.title}" logged.`, Receipt);
    setForm({ categoryId: data.expenseCategories[0]?.categoryId, accountId: data.accountSetups[0]?.accountId, title: "", amount: "", vendorName: "", notes: "" });
  };

  return (
    <div>
      <PageHeader eyebrow="Expense Module" title="Expense Entries" subtitle="Daily operational expenses, deducted from a selected account." />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {perms.canCreate && (
          <div className="card vital-bar-gold" style={{ padding: 16, height: "fit-content" }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Log Expense</div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Title</label><input className="input focus-ring" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Category</label><select className="select focus-ring" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>{data.expenseCategories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Amount</label><input type="number" step="0.01" className="input focus-ring" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Vendor</label><input className="input focus-ring" value={form.vendorName} onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))} /></div>
            <div style={{ marginBottom: 10 }}><label className="field-label">Deduct From Account</label><select className="select focus-ring" value={form.accountId} onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}>{data.accountSetups.filter((a) => a.isActive).map((a) => <option key={a.accountId} value={a.accountId}>{a.accountName} · {fmtMoney(a.currentBalance)}</option>)}</select></div>
            <div style={{ marginBottom: 14 }}><label className="field-label">Notes</label><input className="input focus-ring" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
            <button className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center" }} onClick={addEntry}><Plus size={14} /> Log Expense</button>
          </div>
        )}
        <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Vendor</th><th>Account</th><th>Amount</th></tr></thead>
            <tbody>
              {data.expenseEntries.map((e) => (
                <tr key={e.expenseId}>
                  <td>{fmtDate(e.expenseDate)}</td>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td><Badge tone="slate">{data.expenseCategories.find((c) => c.categoryId === e.categoryId)?.categoryName}</Badge></td>
                  <td style={{ color: "var(--muted)" }}>{e.vendorName}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{data.accountSetups.find((a) => a.accountId === e.accountId)?.accountName}</td>
                  <td className="tabular" style={{ fontWeight: 700, color: "var(--danger)" }}>-{fmtMoney(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================ REPORTS & ANALYTICS ============================ */

function FinancialReportsPage({ data, perms }) {
  if (!perms.canRead) return <NoAccessState />;
  const totalRevenue = data.invoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalExpense = data.expenseEntries.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const revenueByServices = data.invoiceServices.reduce((s, x) => s + x.unitPrice, 0);
  const revenueByProducts = data.invoiceProducts.reduce((s, x) => s + x.unitPrice * x.quantity, 0);
  const supplierBalance = supplierLedger(data).reduce((s, x) => s + x.balance, 0);
  const patientBalance = data.patientTreatmentPlans.reduce((s, p) => s + p.balanceRemaining, 0);

  return (
    <div>
      <PageHeader eyebrow="Reports & Analytics" title="Financial Reports" subtitle="Profit & loss, cashflow per account, and outstanding balances." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} icon={TrendingUp} />
        <StatCard label="Total Expenses" value={fmtMoney(totalExpense)} icon={TrendingDown} />
        <StatCard label="Net Profit" value={fmtMoney(netProfit)} icon={FileBarChart} tone={netProfit < 0 ? "alert" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
        <div className="card vital-bar" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Cashflow Ledger per Account</div>
          <table className="data-table">
            <thead><tr><th>Account</th><th>Balance</th></tr></thead>
            <tbody>{data.accountSetups.map((a) => <tr key={a.accountId}><td style={{ fontWeight: 600 }}>{a.accountName}</td><td className="tabular" style={{ fontWeight: 700, color: "var(--forest)" }}>{fmtMoney(a.currentBalance)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card vital-bar-gold" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Revenue: Services vs Products</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span>Services</span><span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(revenueByServices)}</span></div><Bar pct={(revenueByServices / (revenueByServices + revenueByProducts || 1)) * 100} color="var(--forest)" /></div>
            <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span>Products</span><span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(revenueByProducts)}</span></div><Bar pct={(revenueByProducts / (revenueByServices + revenueByProducts || 1)) * 100} color="var(--gold-dark)" /></div>
          </div>
        </div>
      </div>

      <div className="font-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Outstanding Balances</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StatCard label="Supplier Liabilities Outstanding" value={fmtMoney(supplierBalance)} icon={Landmark} tone={supplierBalance > 0 ? "alert" : undefined} />
        <StatCard label="Patient Plan Balances Outstanding" value={fmtMoney(patientBalance)} icon={UsersIcon} tone={patientBalance > 0 ? "alert" : undefined} />
      </div>
    </div>
  );
}

function ClinicalReportsPage({ data, perms }) {
  if (!perms.canRead) return <NoAccessState />;
  const allCycles = data.planCycles;
  const completed = allCycles.filter((c) => c.status === "COMPLETED").length;
  const completionRate = allCycles.length ? Math.round((completed / allCycles.length) * 100) : 0;
  const attendanceThisMonth = allCycles.filter((c) => c.status === "COMPLETED" && c.executionDate && new Date(c.executionDate).getMonth() + 1 === 7).length;
  const walkins = data.patients.filter((p) => p.patientType === "WALK_IN").length;
  const registered = data.patients.filter((p) => p.patientType === "REGISTERED").length;
  const conversionRate = data.patients.length ? Math.round((registered / data.patients.length) * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow="Reports & Analytics" title="Clinical Reports" subtitle="Cycle completion, patient attendance and walk-in conversion." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard label="Cycle Completion Rate" value={`${completionRate}%`} sub={`${completed}/${allCycles.length} cycles completed`} icon={CalendarCheck2} />
        <StatCard label="Patient Attendance (Jul)" value={attendanceThisMonth} sub="Completed visits this month" icon={Stethoscope} />
        <StatCard label="Walk-in → Registered" value={`${conversionRate}%`} sub={`${registered} registered of ${data.patients.length} total`} icon={ArrowRightLeft} />
      </div>
      <div className="card" style={{ padding: 18 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Patient Type Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span>Walk-in</span><span className="tabular" style={{ fontWeight: 700 }}>{walkins}</span></div><Bar pct={(walkins / data.patients.length) * 100} color="var(--gold-dark)" /></div>
          <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span>Registered</span><span className="tabular" style={{ fontWeight: 700 }}>{registered}</span></div><Bar pct={(registered / data.patients.length) * 100} color="var(--forest)" /></div>
        </div>
      </div>
    </div>
  );
}

function InventoryAuditReportsPage({ data, perms }) {
  if (!perms.canRead) return <NoAccessState />;
  const byType = ["PO_RECEIVE", "DIRECT_SALE", "ADJUSTMENT", "RETURN"].map((t) => ({ type: t, count: data.stockMovementLogs.filter((l) => l.movementType === t).length, total: data.stockMovementLogs.filter((l) => l.movementType === t).reduce((s, l) => s + Math.abs(l.quantityChanged), 0) }));
  const lowStock = data.productSkus.filter((s) => s.currentStock <= s.reorderLevel);
  const usageBySku = data.productSkus.map((s) => ({ sku: s, used: data.stockMovementLogs.filter((l) => l.skuId === s.skuId && l.quantityChanged < 0).reduce((sum, l) => sum + Math.abs(l.quantityChanged), 0) })).sort((a, b) => b.used - a.used);

  return (
    <div>
      <PageHeader eyebrow="Reports & Analytics" title="Inventory Audit Reports" subtitle="Stock movement summary, low-stock alerts and usage trends." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {byType.map((t) => <StatCard key={t.type} label={t.type.replace("_", " ")} value={t.count} sub={`${t.total} units total`} icon={ArrowRightLeft} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card vital-bar-gold" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Low Stock Alerts</div>
          {lowStock.length === 0 ? <EmptyState icon={PackageCheck} text="All SKUs are above reorder level." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lowStock.map((s) => (
                <div key={s.skuId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "var(--gold-tint)", borderRadius: 8, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{s.skuCode}</span><span className="tabular">{s.currentStock} / reorder {s.reorderLevel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Product Usage Trend</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {usageBySku.map(({ sku, used }) => (
              <div key={sku.skuId}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span>{sku.skuCode}</span><span className="tabular" style={{ fontWeight: 700 }}>{used} used</span></div>
                <Bar pct={(used / (usageBySku[0]?.used || 1)) * 100} color="var(--forest)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================== APP =================================== */

/* =================================== AUTHENTICATION =================================== */

const DEMO_PASSWORD = "vera2026";
const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

function AuthShell({ children }) {
  return (
    <div className="vera-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, var(--navy) 0%, var(--forest-dark) 100%)", padding: 20 }}>
      <GlobalStyles />
      <div className="card" style={{ width: 420, maxWidth: "100%", padding: "34px 32px", borderTop: "3px solid var(--gold)" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, border: "1.5px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Scissors size={20} color="var(--gold-dark)" strokeWidth={2.2} />
          </div>
          <div className="wordmark" style={{ fontSize: 16, color: "var(--forest)" }}>VERA</div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", letterSpacing: ".05em" }}>HAIR TRANSPLANT CLINIC</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, label }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <div style={{ position: "relative" }}>
        <Lock size={13} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted-2)" }} />
        <input type={show ? "text" : "password"} className="input focus-ring" style={{ paddingLeft: 32, paddingRight: 36 }} value={value} onChange={onChange} placeholder={placeholder} />
        <button type="button" className="btn btn-ghost btn-sm focus-ring" style={{ position: "absolute", right: 3, top: 3, padding: 5 }} onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function LoginStep({ onSuccess, onForgot }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const user = seed.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) { setError("No account found for that username."); return; }
    if (!user.isActive) { setError("This account has been disabled. Contact an Admin."); return; }
    if (password !== DEMO_PASSWORD) { setError(`Incorrect password. (Demo password: ${DEMO_PASSWORD})`); return; }
    setError("");
    onSuccess(user);
  };

  return (
    <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }}>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Sign in to your account</div>
      <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 22 }}>Access the clinic operations dashboard.</div>
      <div style={{ marginBottom: 12 }}>
        <label className="field-label">Username</label>
        <div style={{ position: "relative" }}>
          <UserCog size={13} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted-2)" }} />
          <input className="input focus-ring" style={{ paddingLeft: 32 }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. a.reyes" autoFocus />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button type="button" onClick={onForgot} className="focus-ring" style={{ background: "none", border: "none", color: "var(--forest)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>Forgot password?</button>
      </div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--danger-tint)", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}><AlertTriangle size={14} /> {error}</div>}
      <button type="button" onClick={submit} className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center", padding: "10px 14px" }}>Sign In</button>
      <div className="hairline" style={{ margin: "20px 0 14px" }} />
      <div style={{ fontSize: 11, color: "var(--muted-2)", textAlign: "center", lineHeight: 1.6 }}>
        Demo accounts: <span className="font-mono">a.reyes</span>, <span className="font-mono">d.osei</span>, <span className="font-mono">m.lopez</span><br />
        Demo password: <span className="font-mono" style={{ fontWeight: 700, color: "var(--forest)" }}>{DEMO_PASSWORD}</span>
      </div>
    </div>
  );
}

function VerifyStep({ pendingUser, onVerified, onBack }) {
  const [demoCode] = useState(genCode);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (codeInput.trim() !== demoCode) { setError("Incorrect verification code."); return; }
    onVerified();
  };

  return (
    <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }}>
      <button type="button" onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ marginBottom: 8 }}><ArrowLeft size={13} /> Back</button>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <MailCheck size={26} color="var(--gold-dark)" style={{ margin: "0 auto 10px" }} />
      </div>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Verify it's you</div>
      <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 18 }}>We sent a 6-digit code to {pendingUser.email}.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--gold-tint)", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "var(--gold-dark)", fontWeight: 600, justifyContent: "center" }}>
        Demo code: <span className="font-mono" style={{ fontSize: 14, letterSpacing: "2px" }}>{demoCode}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label className="field-label">6-Digit Code</label>
        <input className="input focus-ring font-mono" style={{ textAlign: "center", fontSize: 18, letterSpacing: "6px" }} maxLength={6} value={codeInput} onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))} placeholder="000000" autoFocus />
      </div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--danger-tint)", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}><AlertTriangle size={14} /> {error}</div>}
      <button type="button" onClick={submit} disabled={codeInput.length !== 6} className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center", padding: "10px 14px", marginTop: 8 }}><ShieldCheck size={14} /> Verify & Continue</button>
    </div>
  );
}

function ForgotPasswordStep({ onCodeSent, onBack }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const user = seed.users.find((u) => u.username.toLowerCase() === usernameOrEmail.trim().toLowerCase() || u.email.toLowerCase() === usernameOrEmail.trim().toLowerCase());
    if (!user) { setError("No account matches that username or email."); return; }
    onCodeSent(user, genCode());
  };
  return (
    <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }}>
      <button type="button" onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ marginBottom: 8 }}><ArrowLeft size={13} /> Back to Sign In</button>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <ShieldQuestion size={26} color="var(--gold-dark)" style={{ margin: "0 auto 10px" }} />
      </div>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Reset your password</div>
      <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 20 }}>Enter your username or email and we'll send a reset code.</div>
      <div style={{ marginBottom: 14 }}>
        <label className="field-label">Username or Email</label>
        <div style={{ position: "relative" }}>
          <Mail size={13} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted-2)" }} />
          <input className="input focus-ring" style={{ paddingLeft: 32 }} value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="a.reyes or alina@verahairclinic.com" autoFocus />
        </div>
      </div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--danger-tint)", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}><AlertTriangle size={14} /> {error}</div>}
      <button type="button" onClick={submit} className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center", padding: "10px 14px" }}>Send Reset Code</button>
    </div>
  );
}

function ResetPasswordStep({ user, demoCode, onReset, onBack }) {
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (codeInput.trim() !== demoCode) { setError("Incorrect reset code."); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    onReset();
  };

  return (
    <div onKeyDown={(e) => { if (e.key === "Enter") submit(); }}>
      <button type="button" onClick={onBack} className="btn btn-ghost btn-sm focus-ring" style={{ marginBottom: 8 }}><ArrowLeft size={13} /> Back</button>
      <div className="font-display" style={{ fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>Choose a new password</div>
      <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 18 }}>A reset code was sent to {user.email}.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--gold-tint)", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "var(--gold-dark)", fontWeight: 600, justifyContent: "center" }}>
        Demo code: <span className="font-mono" style={{ fontSize: 14, letterSpacing: "2px" }}>{demoCode}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="field-label">Reset Code</label>
        <input className="input focus-ring font-mono" style={{ textAlign: "center", fontSize: 16, letterSpacing: "4px" }} maxLength={6} value={codeInput} onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ""))} placeholder="000000" autoFocus />
      </div>
      <div style={{ marginBottom: 12 }}><PasswordField label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" /></div>
      <div style={{ marginBottom: 8 }}><PasswordField label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" /></div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--danger-tint)", borderRadius: 8, marginTop: 6, marginBottom: 14, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}><AlertTriangle size={14} /> {error}</div>}
      <button type="button" onClick={submit} className="btn btn-primary focus-ring" style={{ width: "100%", justifyContent: "center", padding: "10px 14px", marginTop: 8 }}><Check size={14} /> Reset Password</button>
    </div>
  );
}

function AuthFlow({ onAuthenticated }) {
  const [step, setStep] = useState("login"); // login | verify | forgot | reset | reset_done
  const [pendingUser, setPendingUser] = useState(null);
  const [resetCode, setResetCode] = useState("");
  const [toast, setToast] = useState("");

  return (
    <AuthShell>
      {step === "login" && (
        <LoginStep onSuccess={(user) => { setPendingUser(user); setStep("verify"); }} onForgot={() => setStep("forgot")} />
      )}
      {step === "verify" && (
        <VerifyStep pendingUser={pendingUser} onVerified={() => onAuthenticated(pendingUser)} onBack={() => setStep("login")} />
      )}
      {step === "forgot" && (
        <ForgotPasswordStep onCodeSent={(user, code) => { setPendingUser(user); setResetCode(code); setStep("reset"); }} onBack={() => setStep("login")} />
      )}
      {step === "reset" && (
        <ResetPasswordStep user={pendingUser} demoCode={resetCode} onBack={() => setStep("forgot")}
          onReset={() => { setToast("Password reset — note the demo password remains unchanged in this prototype."); setStep("login"); }} />
      )}
      {toast && step === "login" && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--forest-tint)", borderRadius: 8, fontSize: 11.5, color: "var(--forest)", fontWeight: 600 }}>
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}
    </AuthShell>
  );
}

/* =================================== APP =================================== */

const STORAGE_KEY = "vera-cms-data-v1";

function MainApp({ currentUser, onLogout }) {
  const [data, setData] = useState(null);
  const [saveStatus, setSaveStatus] = useState("loading");
  const [currentRoleId, setCurrentRoleId] = useState(currentUser.roleId);
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const { toasts, push: pushToast } = useToasts();
  const skipNextSave = useRef(true);
  const welcomedRef = useRef(false);

  useEffect(() => {
    if (data && !welcomedRef.current) {
      welcomedRef.current = true;
      pushToast(`Welcome back, ${currentUser.fullName.split(" ")[0]}.`, CheckCircle2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Load persisted data on mount (falls back to seed demo data if nothing saved yet)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (!cancelled) {
          setData(result && result.value ? JSON.parse(result.value) : seed);
          setSaveStatus("saved");
        }
      } catch (err) {
        if (!cancelled) { setData(seed); setSaveStatus("idle"); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced auto-save whenever data changes (skips the very first load-triggered set)
  useEffect(() => {
    if (data === null) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const result = await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
        setSaveStatus(result ? "saved" : "error");
      } catch (err) {
        setSaveStatus("error");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [data]);

  const resetData = useCallback(async () => {
    skipNextSave.current = true;
    setData(seed);
    setSaveStatus("saving");
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(seed), false);
      setSaveStatus(result ? "saved" : "error");
    } catch (err) {
      setSaveStatus("error");
    }
  }, []);

  const permFor = useCallback((navPageId) => {
    if (!data) return { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    const rp = data.rolePermissions.find((x) => x.roleId === currentRoleId && x.navPageId === navPageId);
    return rp || { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentRoleId]);
  const canRead = useCallback((navPageId) => permFor(navPageId).canRead, [permFor]);

  useEffect(() => {
    if (!data) return;
    if (!canRead(PAGE_META[activePage].navPageId)) {
      const firstVisible = Object.entries(PAGE_META).find(([, m]) => canRead(m.navPageId));
      if (firstVisible) setActivePage(firstVisible[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoleId, data]);

  if (!data) {
    return (
      <div className="vera-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <GlobalStyles />
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, border: "2px solid var(--gold)", borderTopColor: "transparent", margin: "0 auto 14px", animation: "spin 0.9s linear infinite" }} />
          <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "var(--forest)" }}>Loading VERA CMS…</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Fetching your saved data</div>
        </div>
      </div>
    );
  }

  const lowStockCount = data.productSkus.filter((s) => s.currentStock <= s.reorderLevel).length;
  const perms = permFor(PAGE_META[activePage].navPageId);

  let content;
  if (activePage === "dashboard") content = <DashboardPage data={data} perms={perms} />;
  else if (activePage === "system_configuration") content = <SystemConfigurationPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "modules") content = <ModulesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "navpages") content = <NavPagesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "roles_permissions") content = <RolesPermissionsPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "users") content = <UsersPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "products") content = <ProductsPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "suppliers") content = <SuppliersPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "purchase_orders") content = <PurchaseOrdersPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "po_returns") content = <POReturnsPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "supplier_payments") content = <SupplierPaymentsPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "stock_movements") content = <StockMovementsPage data={data} perms={perms} />;
  else if (activePage === "services") content = <ServicesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "patients") content = <PatientDirectoryPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "treatment_plans") content = <TreatmentPlanMasterPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "active_plans") content = <ActivePatientPlansPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "billing") content = <BillingInvoicesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "expense_categories") content = <ExpenseCategoriesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "setup_expenses") content = <SetupExpensesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "budget_estimates") content = <BudgetEstimatesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "expense_entries") content = <ExpenseEntriesPage data={data} setData={setData} perms={perms} pushToast={pushToast} />;
  else if (activePage === "reports_financial") content = <FinancialReportsPage data={data} perms={perms} />;
  else if (activePage === "reports_clinical") content = <ClinicalReportsPage data={data} perms={perms} />;
  else if (activePage === "reports_inventory") content = <InventoryAuditReportsPage data={data} perms={perms} />;

  return (
    <div className="vera-root" style={{ display: "flex", minHeight: "100vh" }}>
      <GlobalStyles />
      <Sidebar data={data} activePage={activePage} onNavigate={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed} canRead={canRead} lowStockCount={lowStockCount} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TopBar pageLabel={PAGE_META[activePage].label} alertCount={lowStockCount} data={data} currentRoleId={currentRoleId} setCurrentRoleId={setCurrentRoleId} saveStatus={saveStatus} onResetClick={resetData} currentUser={currentUser} onLogout={onLogout} pushToast={pushToast} />
        <div style={{ padding: 26, maxWidth: 1400, margin: "0 auto" }}>{content}</div>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}

export default function App() {
  const [authedUser, setAuthedUser] = useState(null);
  if (!authedUser) return <AuthFlow onAuthenticated={(user) => setAuthedUser(user)} />;
  return <MainApp currentUser={authedUser} onLogout={() => setAuthedUser(null)} />;
}
