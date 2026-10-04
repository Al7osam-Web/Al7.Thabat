using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.CrudExamples;

public class CrudExample : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    protected CrudExample()
    {
    }

    public CrudExample(Guid id, string name, string? description, bool isActive = true)
        : base(id)
    {
        SetName(name);
        SetDescription(description);
        IsActive = isActive;
    }

    public void SetName(string name)
    {
        Name = Check.NotNullOrWhiteSpace(name, nameof(name), CrudExampleConsts.MaxNameLength);
    }

    public void SetDescription(string? description)
    {
        Description = Check.Length(description, nameof(description), CrudExampleConsts.MaxDescriptionLength);
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
