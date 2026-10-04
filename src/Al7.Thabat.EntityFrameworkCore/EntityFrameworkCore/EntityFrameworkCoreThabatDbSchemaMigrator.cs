using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Al7.Thabat.Data;
using Volo.Abp.DependencyInjection;

namespace Al7.Thabat.EntityFrameworkCore;

public class EntityFrameworkCoreThabatDbSchemaMigrator
    : IThabatDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreThabatDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the ThabatDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<ThabatDbContext>()
            .Database
            .MigrateAsync();
    }
}
