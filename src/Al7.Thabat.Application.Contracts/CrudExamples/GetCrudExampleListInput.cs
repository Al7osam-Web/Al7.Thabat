using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.CrudExamples;

public class GetCrudExampleListInput : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }

    public bool? IsActive { get; set; }
}
