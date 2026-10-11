using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Books;

[Table("Books")]
[Serializable]
[DisableAuditing]
public class Book : AuditedEntity<long>
{
    public virtual bool IsRelapse { get; set; }
    public virtual string? NameAr { get; set; }
    public virtual string? NameEn { get; set; }
    public virtual string? CoverImage { get; set; }
    public virtual bool IsFree { get; set; }
    public virtual ICollection<BookMedia> Media { get; set; } = new List<BookMedia>();
}
