using System;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.CrudExamples;

public class CrudExampleDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }
}
