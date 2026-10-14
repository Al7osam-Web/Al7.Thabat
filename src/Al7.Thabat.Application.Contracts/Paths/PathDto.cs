using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Al7.Thabat.Tasks;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Paths;

public class PathEntryDto
{
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public int Sort { get; set; }
}

public class PathEntryInputDto
{
    [Required]
    [StringLength(4000)]
    public string DescriptionAr { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? DescriptionEn { get; set; }

    public int Sort { get; set; }
}

public class PathDto : EntityDto<long>
{
    public TaskStage Stage { get; set; }
    public int Day { get; set; }
    public int FeelingsCount { get; set; }
    public int ChallengesCount { get; set; }
    public int TipsCount { get; set; }
    public DateTime CreationTime { get; set; }
    public List<PathEntryDto> Feelings { get; set; } = new();
    public List<PathEntryDto> Challenges { get; set; } = new();
    public List<PathEntryDto> Tips { get; set; } = new();
}

public class CreateUpdatePathDto
{
    [Required]
    public TaskStage Stage { get; set; }

    [Range(1, 3650)]
    public int Day { get; set; }

    public List<PathEntryInputDto> Feelings { get; set; } = new();
    public List<PathEntryInputDto> Challenges { get; set; } = new();
    public List<PathEntryInputDto> Tips { get; set; } = new();
}

public class PathColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetPathsInput : PagedAndSortedResultRequestDto
{
    public List<PathColumnFilterDto>? ColumnFilters { get; set; }
}

public class PathsPagedResultDto
{
    public long TotalCount { get; set; }
    public List<PathDto> Items { get; set; } = new();
    public int TotalPaths { get; set; }
    public int SevenDaysCount { get; set; }
    public int ThirtyDaysCount { get; set; }
    public int NinetyDaysCount { get; set; }
}
