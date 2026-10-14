using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.PermissionManagement;

namespace Al7.Thabat.Paths;

public class PathPermissionDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IPermissionDataSeeder _permissionDataSeeder;

    public PathPermissionDataSeedContributor(IPermissionDataSeeder permissionDataSeeder)
    {
        _permissionDataSeeder = permissionDataSeeder;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        await _permissionDataSeeder.SeedAsync(
            RolePermissionValueProvider.ProviderName,
            "admin",
            [
                ThabatPermissions.Paths.Default,
                ThabatPermissions.Paths.Create,
                ThabatPermissions.Paths.Edit,
                ThabatPermissions.Paths.Delete
            ],
            context?.TenantId
        );
    }
}
