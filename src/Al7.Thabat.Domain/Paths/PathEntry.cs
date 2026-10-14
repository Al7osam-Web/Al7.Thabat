using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;

namespace Al7.Thabat.Paths;

[Table("PathEntry")]
[Serializable]
[DisableAuditing]
public class PathEntry : Entity<long>
{
    public virtual long PathDayId { get; set; }

    [ForeignKey(nameof(PathDayId))]
    public virtual PathDay? PathDay { get; set; }

    public virtual PathSection Section { get; set; }
    public virtual string? DescriptionAr { get; set; }
    public virtual string? DescriptionEn { get; set; }
    public virtual int Sort { get; set; }
}
