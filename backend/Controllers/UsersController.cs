using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeraApi.Authorization;
using VeraApi.Data;
using VeraApi.Models;
using VeraApi.Services;

namespace VeraApi.Controllers;

public record CreateUserRequest(string Username, string FullName, string Email, string? Phone, int RoleId, string InitialPassword);
public record UpdateUserRequest(string FullName, string Email, string? Phone, int RoleId, bool IsActive);

[Route("api/users")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class UsersController : ControllerBase
{
    private readonly VeraDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IVerificationCodeService _codes;

    public UsersController(VeraDbContext db, IPasswordHasher hasher, IVerificationCodeService codes)
    {
        _db = db; _hasher = hasher; _codes = codes;
    }

    [HttpGet, RequiresPermission(NavPageIds.Users, Permission.Read)]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
        => Ok(await _db.Users.Include(u => u.Role).AsNoTracking()
            .Select(u => new { u.Id, u.UserCode, u.Username, u.FullName, u.Email, u.Phone, u.RoleId, RoleName = u.Role.RoleName, u.IsActive, u.CreatedAt })
            .ToListAsync());

    [HttpPost, RequiresPermission(NavPageIds.Users, Permission.Create)]
    public async Task<ActionResult<object>> Create(CreateUserRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
            return Conflict(new { message = "Username or email already in use." });

        var userCount = await _db.Users.CountAsync();
        var user = new User
        {
            UserCode = $"U-{(userCount + 1):000}",
            Username = request.Username,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            RoleId = request.RoleId,
            PasswordHash = _hasher.Hash(request.InitialPassword),
            IsActive = true,
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { user.Id, user.UserCode, user.Username, user.FullName, user.Email, user.RoleId });
    }

    [HttpPut("{id}"), RequiresPermission(NavPageIds.Users, Permission.Update)]
    public async Task<IActionResult> Update(long id, UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        user.RoleId = request.RoleId;
        user.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin-triggered reset: issues a code and (in production) emails the user
    // a reset link. Reuses the same VerificationCodeService as self-service
    // "Forgot password".
    [HttpPost("{id}/send-password-reset"), RequiresPermission(NavPageIds.Users, Permission.Update)]
    public async Task<IActionResult> SendPasswordReset(long id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();
        await _codes.IssueCodeAsync(user.Id, VerificationPurpose.PasswordReset);
        return Ok(new { message = $"Password reset code sent to {user.Email}." });
    }
}
