using Volo.Abp.Modularity;

namespace Al7.Thabat;

[DependsOn(
    typeof(ThabatApplicationModule),
    typeof(ThabatDomainTestModule)
)]
public class ThabatApplicationTestModule : AbpModule
{

}
