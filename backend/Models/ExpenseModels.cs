using System.ComponentModel.DataAnnotations;

namespace VeraApi.Models;

public class ExpenseCategory
{
    [Key]
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
}

public class SetupExpense
{
    [Key]
    public int SetupExpenseId { get; set; }
    public string ItemName { get; set; } = default!;
    public decimal Amount { get; set; }
}

public class ExpenseBudgetEstimate
{
    [Key]
    public int EstimateId { get; set; }
    public int CategoryId { get; set; }
    public ExpenseCategory Category { get; set; } = default!;
    
    // Updated property name to match controller
    public decimal BudgetedAmount { get; set; } 
    public int Month { get; set; }
    public int Year { get; set; }
}

public class ExpenseEntry
{
    [Key]
    public int ExpenseEntryId { get; set; }
    
    public string Title { get; set; } = default!;
    public string? VendorName { get; set; }
    
    public int CategoryId { get; set; }
    public ExpenseCategory Category { get; set; } = default!;
    
    public int AccountId { get; set; }
    public AccountSetup Account { get; set; } = default!;
    
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    
    public long? LoggedByUserId { get; set; }
    public User? LoggedByUser { get; set; }
}