using VeraApi.Services;

namespace VeraApi.Data;

public static class DbSeeder
{
    public static Task SeedAsync(VeraDbContext db, IPasswordHasher hasher)
    {
        // No seeding performed
        return Task.CompletedTask;
    }
}