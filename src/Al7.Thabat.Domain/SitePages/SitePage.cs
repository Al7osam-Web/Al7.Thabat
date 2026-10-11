using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities;

namespace Al7.Thabat.SitePages;

[Table("AppSitePages")]
public class SitePage : Entity<long>
{
    public virtual string? Key { get; set; }
    public virtual string? Section { get; set; }
    public virtual string? Value { get; set; }
    public virtual PageEnum PageEnum { get; set; }
    public virtual LanguageEnum? Language { get; set; }
    public virtual int? Sort { get; set; }
    public virtual bool? IsHidden { get; set; }
}
