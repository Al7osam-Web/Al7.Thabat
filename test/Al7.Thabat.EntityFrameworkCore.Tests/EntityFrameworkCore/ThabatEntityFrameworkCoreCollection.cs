using Xunit;

namespace Al7.Thabat.EntityFrameworkCore;

[CollectionDefinition(ThabatTestConsts.CollectionDefinitionName)]
public class ThabatEntityFrameworkCoreCollection : ICollectionFixture<ThabatEntityFrameworkCoreFixture>
{

}
