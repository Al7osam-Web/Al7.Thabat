using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.SitePages;

public class SitePageDto : EntityDto<long>
{
    public string? Key { get; set; }
    public string? Value { get; set; }
    public string? Section { get; set; }
    public PageEnum PageEnum { get; set; }
    public LanguageEnum? Language { get; set; }
    public int? Sort { get; set; }
    public bool? IsHidden { get; set; }
}

public class CreateSitePageDto
{
    public long? Id { get; set; }
    public string? Key { get; set; }
    public string? Value { get; set; }
    public string? Section { get; set; }
    public PageEnum PageEnum { get; set; }
    public LanguageEnum? Language { get; set; }
    public int? Sort { get; set; }
    public bool? IsHidden { get; set; }
    public EntityAction EntityAction { get; set; }
}

public class ManageSitePageDto
{
    [Required]
    public List<CreateSitePageDto> SitePage { get; set; } = new();
}

public class GetAllSitePages : PagedResultRequestDto
{
    public PageEnum? PageEnum { get; set; }
    public LanguageEnum? Language { get; set; }
    public bool? IsHidden { get; set; }
    public string? Key { get; set; }
    public string? Section { get; set; }
}
