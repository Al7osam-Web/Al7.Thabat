using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Al7.Thabat.SitePages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Controllers.SitePages;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/site-pages")]
[Produces("application/json")]
public class SitePagesController : ThabatController
{
    private readonly ISitePagesAppService _sitePagesAppService;

    public SitePagesController(ISitePagesAppService sitePagesAppService)
    {
        _sitePagesAppService = sitePagesAppService;
    }

    [HttpGet]
    [AllowAnonymous]
    public Task<PagedResultDto<SitePageDto>> GetListAsync([FromQuery] GetAllSitePages input)
    {
        return _sitePagesAppService.GetListAsync(input);
    }

    [HttpPost("manage")]
    [Authorize(ThabatPermissions.SitePages.Default)]
    public Task<bool> ManageAsync([FromBody] ManageSitePageDto input)
    {
        return _sitePagesAppService.ManageAsync(input);
    }
}
