using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Tasks;

[Table("Tasks")]
[Serializable]
[DisableAuditing]
public class TaskItem : AuditedEntity<long>
{
    public virtual TaskStage Stage { get; set; }
    public virtual string? TitleAr { get; set; }
    public virtual string? TitleEn { get; set; }
    public virtual string? SubTitleAr { get; set; }
    public virtual string? SubTitleEn { get; set; }
    public virtual int Day { get; set; }
}
