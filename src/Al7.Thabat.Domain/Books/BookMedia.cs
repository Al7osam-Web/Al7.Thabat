using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Books;

[Table("BooksMedia")]
[Serializable]
[DisableAuditing]
public class BookMedia : AuditedEntity<long>
{
    public virtual long BookId { get; set; }
    [ForeignKey("BookId")]
    public virtual Book? Book { get; set; }
    public virtual string? FilePath { get; set; }
}
