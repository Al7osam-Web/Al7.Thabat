using Volo.Abp.Modularity;

namespace Al7.Thabat;

[DependsOn(
    typeof(ThabatDomainModule),
    typeof(ThabatTestBaseModule)
)]
public class ThabatDomainTestModule : AbpModule
{

}
