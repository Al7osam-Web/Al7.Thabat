using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Subscriptions;

public interface ISubscriptionPackageAppService : IApplicationService
{
    Task<SubscriptionPackagesPagedResultDto> GetPagedAsync(GetSubscriptionPackagesInput input);
    Task<SubscriptionPackageDto> GetAsync(long id);
    Task<SubscriptionPackageDto> CreateAsync(CreateUpdateSubscriptionPackageDto input);
    Task<SubscriptionPackageDto> UpdateAsync(long id, CreateUpdateSubscriptionPackageDto input);
    Task DeleteAsync(long id);
}
