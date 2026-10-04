using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace Al7.Thabat.Data;

/* This is used if database provider does't define
 * IThabatDbSchemaMigrator implementation.
 */
public class NullThabatDbSchemaMigrator : IThabatDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
