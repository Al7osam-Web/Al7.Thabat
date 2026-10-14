using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Subscriptions;

[Table("SubscriptionPackages")]
[Serializable]
[DisableAuditing]
public class SubscriptionPackage : AuditedEntity<long>
{
    public virtual string? NameAr { get; set; }
    public virtual string? NameEn { get; set; }
    public virtual string? DescriptionAr { get; set; }
    public virtual string? DescriptionEn { get; set; }
    public virtual SubscriptionPeriod Period { get; set; }
    public virtual decimal Price { get; set; }
    public virtual decimal BilledPrice { get; set; }
    public virtual decimal OriginalPrice { get; set; }
    public virtual int Sort { get; set; }
    public virtual bool IsFeatured { get; set; }
}
