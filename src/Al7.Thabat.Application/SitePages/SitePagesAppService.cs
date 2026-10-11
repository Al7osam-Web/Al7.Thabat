using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.SitePages;

[RemoteService(false)]
public class SitePagesAppService : ThabatAppService, ISitePagesAppService
{
    private readonly IRepository<SitePage, long> _sitePageRepository;

    public SitePagesAppService(IRepository<SitePage, long> sitePageRepository)
    {
        _sitePageRepository = sitePageRepository;
    }

    [AllowAnonymous]
    public async Task<PagedResultDto<SitePageDto>> GetListAsync(GetAllSitePages input)
    {
        var query = await _sitePageRepository.GetQueryableAsync();

        query = query.WhereIf(input.PageEnum.HasValue, x => x.PageEnum == input.PageEnum);
        query = query.WhereIf(input.IsHidden.HasValue, x => x.IsHidden == input.IsHidden);
        query = query.WhereIf(
            input.Language.HasValue,
            x => x.Language == input.Language || x.Language == LanguageEnum.None);
        query = query.WhereIf(!string.IsNullOrWhiteSpace(input.Section), x => x.Section == input.Section);
        query = query.WhereIf(!string.IsNullOrWhiteSpace(input.Key), x => x.Key == input.Key);

        var sitePages = await AsyncExecuter.ToListAsync(query.OrderBy(x => x.Id));
        var items = ObjectMapper.Map<List<SitePage>, List<SitePageDto>>(sitePages);

        return new PagedResultDto<SitePageDto>(sitePages.Count, items);
    }

    [Authorize(ThabatPermissions.SitePages.Default)]
    public async Task<bool> ManageAsync(ManageSitePageDto input)
    {
        if (input.SitePage == null || input.SitePage.Count == 0)
        {
            return false;
        }

        foreach (var item in input.SitePage)
        {
            switch (item.EntityAction)
            {
                case EntityAction.Create:
                    if (string.IsNullOrWhiteSpace(item.Value))
                    {
                        break;
                    }

                    await _sitePageRepository.InsertAsync(new SitePage
                    {
                        Key = item.Key,
                        Section = item.Section,
                        Value = item.Value,
                        PageEnum = item.PageEnum,
                        Language = item.Language,
                        Sort = item.Sort,
                        IsHidden = item.IsHidden
                    });
                    break;

                case EntityAction.Update:
                    if (!item.Id.HasValue || item.Id.Value <= 0)
                    {
                        break;
                    }

                    var sitePage = await _sitePageRepository.GetAsync(item.Id.Value);
                    if (string.IsNullOrWhiteSpace(item.Value))
                    {
                        await _sitePageRepository.DeleteAsync(sitePage);
                        break;
                    }

                    sitePage.Key = item.Key;
                    sitePage.Section = item.Section;
                    sitePage.Value = item.Value;
                    sitePage.PageEnum = item.PageEnum;
                    sitePage.Language = item.Language;
                    sitePage.Sort = item.Sort;
                    sitePage.IsHidden = item.IsHidden;
                    await _sitePageRepository.UpdateAsync(sitePage);
                    break;

                case EntityAction.Delete:
                    if (item.Id.HasValue && item.Id.Value > 0)
                    {
                        await _sitePageRepository.DeleteAsync(item.Id.Value);
                    }
                    break;
            }
        }

        return true;
    }
}
