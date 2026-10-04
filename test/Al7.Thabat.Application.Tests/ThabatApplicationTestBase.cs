using Volo.Abp.Modularity;

namespace Al7.Thabat;

public abstract class ThabatApplicationTestBase<TStartupModule> : ThabatTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
