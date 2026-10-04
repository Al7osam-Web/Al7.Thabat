using System.ComponentModel.DataAnnotations;

namespace Al7.Thabat.CrudExamples;

public class CreateUpdateCrudExampleDto
{
    [Required]
    [StringLength(CrudExampleConsts.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [StringLength(CrudExampleConsts.MaxDescriptionLength)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
