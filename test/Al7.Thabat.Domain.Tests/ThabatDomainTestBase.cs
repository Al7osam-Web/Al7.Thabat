using Volo.Abp.Modularity;

namespace Al7.Thabat;

/* Inherit from this class for your domain layer tests. */
public abstract class ThabatDomainTestBase<TStartupModule> : ThabatTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
