using Al7.Thabat.Samples;
using Xunit;

namespace Al7.Thabat.EntityFrameworkCore.Applications;

[Collection(ThabatTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<ThabatEntityFrameworkCoreTestModule>
{

}
