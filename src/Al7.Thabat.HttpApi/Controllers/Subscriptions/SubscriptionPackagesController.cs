using System.Threading.Tasks;
using Al7.Thabat.Subscriptions;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Subscriptions;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/subscription-packages")]
[Produces("application/json")]
public class SubscriptionPackagesController : ThabatController
{
    private readonly ISubscriptionPackageAppService _subscriptionPackageAppService;

    public SubscriptionPackagesController(ISubscriptionPackageAppService subscriptionPackageAppService)
    {
        _subscriptionPackageAppService = subscriptionPackageAppService;
    }

    [HttpPost("paged")]
    public Task<SubscriptionPackagesPagedResultDto> GetPagedAsync([FromBody] GetSubscriptionPackagesInput input)
    {
        return _subscriptionPackageAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<SubscriptionPackageDto> GetAsync(long id)
    {
        return _subscriptionPackageAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<SubscriptionPackageDto> CreateAsync([FromBody] CreateUpdateSubscriptionPackageDto input)
    {
        return _subscriptionPackageAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<SubscriptionPackageDto> UpdateAsync(long id, [FromBody] CreateUpdateSubscriptionPackageDto input)
    {
        return _subscriptionPackageAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _subscriptionPackageAppService.DeleteAsync(id);
    }
}
