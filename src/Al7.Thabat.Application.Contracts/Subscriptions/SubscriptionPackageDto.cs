using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Subscriptions;

public class SubscriptionPackageDto : EntityDto<long>
{
    public string? NameAr { get; set; }
    public string? NameEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public SubscriptionPeriod Period { get; set; }
    public decimal Price { get; set; }
    public decimal BilledPrice { get; set; }
    public decimal OriginalPrice { get; set; }
    public int Sort { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreationTime { get; set; }
}

public class CreateUpdateSubscriptionPackageDto
{
    [Required]
    [StringLength(256)]
    public string NameAr { get; set; } = string.Empty;

    [StringLength(256)]
    public string? NameEn { get; set; }

    [StringLength(512)]
    public string? DescriptionAr { get; set; }

    [StringLength(512)]
    public string? DescriptionEn { get; set; }

    [Required]
    public SubscriptionPeriod Period { get; set; }

    public decimal Price { get; set; }

    public decimal BilledPrice { get; set; }

    public decimal OriginalPrice { get; set; }

    public int Sort { get; set; }

    public bool IsFeatured { get; set; }
}

public class SubscriptionPackageColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetSubscriptionPackagesInput : PagedAndSortedResultRequestDto
{
    public List<SubscriptionPackageColumnFilterDto>? ColumnFilters { get; set; }
}

public class SubscriptionPackagesPagedResultDto
{
    public long TotalCount { get; set; }
    public List<SubscriptionPackageDto> Items { get; set; } = new();
    public int TotalPackages { get; set; }
    public int YearlyCount { get; set; }
    public int ThreeMonthsCount { get; set; }
    public int MonthlyCount { get; set; }
}
