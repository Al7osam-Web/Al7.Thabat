using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Identity;

namespace Al7.Thabat.Clients;

[Table("Clients")]
[Serializable]
[DisableAuditing]
public class Client : FullAuditedEntity<long>
{
    public virtual string? Name { get; set; }
    public virtual string? Avatar { get; set; }
    public virtual string? EmailAddress { get; set; }
    public virtual string? PhoneNumber { get; set; }
    public virtual Guid? UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual IdentityUser? User { get; set; }
    public virtual bool IsActive { get; set; }
}
