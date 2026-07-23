using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Data;
using VeraApi.DTOs.Auth;
using VeraApi.Models;
using VeraApi.Services;

namespace VeraApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly VeraDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IVerificationCodeService _codes;
    private readonly IJwtTokenService _jwt;
    private readonly IConfiguration _config;

    public AuthController(VeraDbContext db, IPasswordHasher hasher, IVerificationCodeService codes, IJwtTokenService jwt, IConfiguration config)
    {
        _db = db; _hasher = hasher; _codes = codes; _jwt = jwt; _config = config;
    }

    // Step 1: username + password. On success, issues a 6-digit code and
    // returns only a PendingUserId — no token yet. Mirrors the frontend's
    // LoginStep -> VerifyStep flow exactly.
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginChallengeResponse>> Login(LoginRequest request)
    {
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null || !user.IsActive || !_hasher.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        await _codes.IssueCodeAsync(user.Id, VerificationPurpose.Login2Fa);

        return Ok(new LoginChallengeResponse(user.Id, "A 6-digit verification code has been sent to your email."));
    }

    // Step 2: 6-digit code -> issues the real access + refresh tokens.
    // This is the point at which the frontend redirects to the Dashboard.
    [HttpPost("verify")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Verify(VerifyRequest request)
    {
        var valid = await _codes.ValidateAndConsumeAsync(request.PendingUserId, VerificationPurpose.Login2Fa, request.Code);
        if (!valid) return BadRequest(new { message = "Incorrect or expired verification code." });

        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == request.PendingUserId);
        if (user is null || !user.IsActive) return Unauthorized();

        return Ok(await IssueAuthResponseAsync(user));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request)
    {
        var hash = _jwt.HashRefreshToken(request.RefreshToken);
        var token = await _db.RefreshTokens.Include(t => t.User).ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(t => t.TokenHash == hash);

        if (token is null || token.RevokedAt is not null || token.ExpiresAt < DateTime.UtcNow)
            return Unauthorized(new { message = "Refresh token is invalid or expired. Please sign in again." });

        token.RevokedAt = DateTime.UtcNow; // rotate on use
        await _db.SaveChangesAsync();

        return Ok(await IssueAuthResponseAsync(token.User));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshRequest request)
    {
        var hash = _jwt.HashRefreshToken(request.RefreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (token is not null) { token.RevokedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }
        return NoContent();
    }

    // "Forgot password" — enter username or email, receive a reset code.
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ForgotPasswordResponse>> ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

        // Always return 200 with a generic message even if not found, to avoid
        // leaking which usernames/emails exist.
        if (user is null || !user.IsActive)
            return Ok(new ForgotPasswordResponse(0, "If an account matches, a reset code has been sent."));

        await _codes.IssueCodeAsync(user.Id, VerificationPurpose.PasswordReset);
        return Ok(new ForgotPasswordResponse(user.Id, "A reset code has been sent to your email."));
    }

    // "Reset password" — code + new password.
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var valid = await _codes.ValidateAndConsumeAsync(request.PendingUserId, VerificationPurpose.PasswordReset, request.Code);
        if (!valid) return BadRequest(new { message = "Incorrect or expired reset code." });

        var user = await _db.Users.FindAsync(request.PendingUserId);
        if (user is null) return NotFound();

        user.PasswordHash = _hasher.Hash(request.NewPassword);

        // Revoke all existing sessions on password reset.
        var activeTokens = await _db.RefreshTokens.Where(t => t.UserId == user.Id && t.RevokedAt == null).ToListAsync();
        foreach (var t in activeTokens) t.RevokedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<AuthResponse> IssueAuthResponseAsync(User user)
    {
        var (accessToken, expiresAt) = _jwt.CreateAccessToken(user);
        var rawRefreshToken = _jwt.CreateRefreshTokenValue();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwt.HashRefreshToken(rawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(int.Parse(_config["Jwt:RefreshTokenDays"] ?? "14")),
        });
        await _db.SaveChangesAsync();

        var summary = new UserSummary(user.Id, user.UserCode, user.Username, user.FullName, user.Email, user.RoleId, user.Role?.RoleName ?? "");
        return new AuthResponse(accessToken, rawRefreshToken, expiresAt, summary);
    }
}
