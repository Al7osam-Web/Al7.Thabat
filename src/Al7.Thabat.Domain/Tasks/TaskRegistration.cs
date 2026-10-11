using System;
using System.ComponentModel.DataAnnotations.Schema;
using Al7.Thabat.Clients;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Tasks;

[Table("TaskRegistrations")]
[Serializable]
[DisableAuditing]
public class TaskRegistration : CreationAuditedEntity<long>
{
    public virtual long TaskId { get; set; }
    [ForeignKey("TaskId")]
    public virtual TaskItem? Task { get; set; }
    public virtual long ClientId { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client? Client { get; set; }
}
