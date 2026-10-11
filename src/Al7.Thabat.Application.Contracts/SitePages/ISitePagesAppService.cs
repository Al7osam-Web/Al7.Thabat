using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.SitePages;

public interface ISitePagesAppService : IApplicationService
{
    Task<PagedResultDto<SitePageDto>> GetListAsync(GetAllSitePages input);
    Task<bool> ManageAsync(ManageSitePageDto input);
}
