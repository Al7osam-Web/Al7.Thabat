using Al7.Thabat.Samples;
using Xunit;

namespace Al7.Thabat.EntityFrameworkCore.Domains;

[Collection(ThabatTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<ThabatEntityFrameworkCoreTestModule>
{

}
