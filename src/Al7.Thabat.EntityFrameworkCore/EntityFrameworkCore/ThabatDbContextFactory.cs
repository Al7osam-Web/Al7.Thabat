using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Al7.Thabat.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class ThabatDbContextFactory : IDesignTimeDbContextFactory<ThabatDbContext>
{
    public ThabatDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        ThabatEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<ThabatDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
        return new ThabatDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Al7.Thabat.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
