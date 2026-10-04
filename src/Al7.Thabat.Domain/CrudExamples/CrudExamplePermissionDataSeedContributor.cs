using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.PermissionManagement;

namespace Al7.Thabat.CrudExamples;

public class CrudExamplePermissionDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IPermissionDataSeeder _permissionDataSeeder;

    public CrudExamplePermissionDataSeedContributor(IPermissionDataSeeder permissionDataSeeder)
    {
        _permissionDataSeeder = permissionDataSeeder;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        await _permissionDataSeeder.SeedAsync(
            RolePermissionValueProvider.ProviderName,
            "admin",
            [
                ThabatPermissions.CrudExamples.Default,
                ThabatPermissions.CrudExamples.Create,
                ThabatPermissions.CrudExamples.Edit,
                ThabatPermissions.CrudExamples.Delete
            ],
            context?.TenantId
        );
    }
}
