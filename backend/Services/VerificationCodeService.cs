using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using VeraApi.Data;
using VeraApi.Models;

namespace VeraApi.Services;

public interface IVerificationCodeService
{
    Task<string> IssueCodeAsync(long userId, string purpose, TimeSpan? ttl = null);
    Task<bool> ValidateAndConsumeAsync(long userId, string purpose, string code);
}

// Swap the actual "sending" (INotificationSender.SendAsync) for a real SMS/Email
// provider (Twilio, SendGrid, etc.) in production — this only issues + validates
// the codes; delivery is a separate concern (see INotificationSender / ConsoleNotificationSender).
public class VerificationCodeService : IVerificationCodeService
{
    private readonly VeraDbContext _db;
    private readonly INotificationSender _notifier;

    public VerificationCodeService(VeraDbContext db, INotificationSender notifier)
    {
        _db = db;
        _notifier = notifier;
    }

    public async Task<string> IssueCodeAsync(long userId, string purpose, TimeSpan? ttl = null)
    {
        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var entry = new VerificationCode
        {
            UserId = userId,
            Purpose = purpose,
            Code = code, // in production: store a hash, not the plaintext code
            ExpiresAt = DateTime.UtcNow.Add(ttl ?? TimeSpan.FromMinutes(10)),
            Consumed = false,
        };
        _db.VerificationCodes.Add(entry);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        if (user is not null)
        {
            await _notifier.SendAsync(user.Email, $"Your VERA verification code is {code}. It expires in 10 minutes.");
        }

        return code;
    }

    public async Task<bool> ValidateAndConsumeAsync(long userId, string purpose, string code)
    {
        var entry = await _db.VerificationCodes
            .Where(v => v.UserId == userId && v.Purpose == purpose && !v.Consumed)
            .OrderByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync();

        if (entry is null || entry.ExpiresAt < DateTime.UtcNow || entry.Code != code)
            return false;

        entry.Consumed = true;
        await _db.SaveChangesAsync();
        return true;
    }
}

public interface INotificationSender
{
    Task SendAsync(string toEmail, string message);
}

// Development stand-in — logs instead of sending. Replace with a real
// email/SMS provider before going to production.
public class ConsoleNotificationSender : INotificationSender
{
    private readonly ILogger<ConsoleNotificationSender> _logger;
    public ConsoleNotificationSender(ILogger<ConsoleNotificationSender> logger) => _logger = logger;

    public Task SendAsync(string toEmail, string message)
    {
        _logger.LogInformation("[DEV NOTIFICATION] To: {Email} — {Message}", toEmail, message);
        return Task.CompletedTask;
    }
}
