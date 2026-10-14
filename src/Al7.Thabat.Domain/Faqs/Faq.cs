using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Faqs;

[Table("Faqs")]
[Serializable]
[DisableAuditing]
public class Faq : AuditedEntity<long>
{
    public virtual string? TitleAr { get; set; }
    public virtual string? TitleEn { get; set; }
    public virtual string? DescriptionAr { get; set; }
    public virtual string? DescriptionEn { get; set; }
    public virtual int Sort { get; set; }
}
