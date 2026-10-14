using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Al7.Thabat.Tasks;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Paths;

[Table("PathDay")]
[Serializable]
[DisableAuditing]
public class PathDay : AuditedEntity<long>
{
    public virtual TaskStage Stage { get; set; }
    public virtual int Day { get; set; }
    public virtual ICollection<PathEntry> Entries { get; set; } = new List<PathEntry>();
}
