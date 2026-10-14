using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Faqs;

public class FaqDto : EntityDto<long>
{
    public string? TitleAr { get; set; }
    public string? TitleEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public int Sort { get; set; }
    public DateTime CreationTime { get; set; }
}

public class CreateUpdateFaqDto
{
    [Required]
    [StringLength(256)]
    public string TitleAr { get; set; } = string.Empty;

    [StringLength(256)]
    public string? TitleEn { get; set; }

    [Required]
    [StringLength(2000)]
    public string DescriptionAr { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? DescriptionEn { get; set; }

    public int Sort { get; set; }
}

public class FaqColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetFaqsInput : PagedAndSortedResultRequestDto
{
    public List<FaqColumnFilterDto>? ColumnFilters { get; set; }
}

public class FaqsPagedResultDto
{
    public long TotalCount { get; set; }
    public List<FaqDto> Items { get; set; } = new();
    public int TotalFaqs { get; set; }
}
