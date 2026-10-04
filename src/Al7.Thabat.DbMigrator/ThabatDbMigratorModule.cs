using Al7.Thabat.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace Al7.Thabat.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(ThabatEntityFrameworkCoreModule),
    typeof(ThabatApplicationContractsModule)
)]
public class ThabatDbMigratorModule : AbpModule
{
}
