namespace VeraApi.DTOs.Auth;

public record LoginRequest(string Username, string Password);

// Returned right after a correct username/password — the client still has to
// pass the VerifyRequest step before receiving a real access token.
public record LoginChallengeResponse(long PendingUserId, string Message);

public record VerifyRequest(long PendingUserId, string Code);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    UserSummary User
);

public record UserSummary(long Id, string UserCode, string Username, string FullName, string Email, int RoleId, string RoleName);

public record RefreshRequest(string RefreshToken);

public record ForgotPasswordRequest(string UsernameOrEmail);

public record ForgotPasswordResponse(long PendingUserId, string Message);

public record ResetPasswordRequest(long PendingUserId, string Code, string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
