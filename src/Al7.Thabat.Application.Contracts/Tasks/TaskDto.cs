using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Tasks;

public class TaskDto : EntityDto<long>
{
    public TaskStage Stage { get; set; }
    public string? TitleAr { get; set; }
    public string? TitleEn { get; set; }
    public string? SubTitleAr { get; set; }
    public string? SubTitleEn { get; set; }
    public int Day { get; set; }
    public DateTime CreationTime { get; set; }
}

public class CreateUpdateTaskDto
{
    [Required]
    public TaskStage Stage { get; set; }

    [Required]
    [StringLength(512)]
    public string TitleAr { get; set; } = string.Empty;

    [StringLength(512)]
    public string? TitleEn { get; set; }

    [StringLength(512)]
    public string? SubTitleAr { get; set; }

    [StringLength(512)]
    public string? SubTitleEn { get; set; }

    [Range(1, 3650)]
    public int Day { get; set; }
}

public class TaskColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetTasksInput : PagedAndSortedResultRequestDto
{
    public List<TaskColumnFilterDto>? ColumnFilters { get; set; }
}

public class TasksPagedResultDto
{
    public long TotalCount { get; set; }
    public List<TaskDto> Items { get; set; } = new();
    public int TotalTasks { get; set; }
    public int SevenDaysCount { get; set; }
    public int ThirtyDaysCount { get; set; }
    public int NinetyDaysCount { get; set; }
}
