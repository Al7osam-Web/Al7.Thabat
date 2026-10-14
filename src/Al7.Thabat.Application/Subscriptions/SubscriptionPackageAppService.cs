using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Subscriptions;

[RemoteService(false)]
public class SubscriptionPackageAppService : ThabatAppService, ISubscriptionPackageAppService
{
    private readonly IRepository<SubscriptionPackage, long> _packageRepository;
    private readonly ICommonRepository _commonRepository;

    public SubscriptionPackageAppService(
        IRepository<SubscriptionPackage, long> packageRepository,
        ICommonRepository commonRepository)
    {
        _packageRepository = packageRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.SubscriptionPackages.Default)]
    public async Task<SubscriptionPackagesPagedResultDto> GetPagedAsync(GetSubscriptionPackagesInput input)
    {
        input ??= new GetSubscriptionPackagesInput();

        var rows = await _commonRepository.GetListStoredProcedureAsync<AdminSubscriptionPackagesGetPagedSpRow>(
            "AdminSubscriptionPackagesGetPaged",
            BuildPagedParameters(input)) ?? new List<AdminSubscriptionPackagesGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new SubscriptionPackageDto
            {
                Id = row.Id,
                NameAr = row.NameAr,
                NameEn = row.NameEn,
                DescriptionAr = row.DescriptionAr,
                DescriptionEn = row.DescriptionEn,
                Period = (SubscriptionPeriod)row.Period,
                Price = row.Price,
                BilledPrice = row.BilledPrice,
                OriginalPrice = row.OriginalPrice,
                Sort = row.Sort,
                IsFeatured = row.IsFeatured,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new SubscriptionPackagesPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalPackages = first?.TotalPackages ?? 0,
            YearlyCount = first?.YearlyCount ?? 0,
            ThreeMonthsCount = first?.ThreeMonthsCount ?? 0,
            MonthlyCount = first?.MonthlyCount ?? 0
        };
    }

    [Authorize(ThabatPermissions.SubscriptionPackages.Default)]
    public async Task<SubscriptionPackageDto> GetAsync(long id)
    {
        var package = await _packageRepository.GetAsync(id);
        return ObjectMapper.Map<SubscriptionPackage, SubscriptionPackageDto>(package);
    }

    [Authorize(ThabatPermissions.SubscriptionPackages.Create)]
    public async Task<SubscriptionPackageDto> CreateAsync(CreateUpdateSubscriptionPackageDto input)
    {
        var package = new SubscriptionPackage();
        ApplyInput(package, input);
        await EnsureUniquePeriodAsync(package.Period);
        await _packageRepository.InsertAsync(package, autoSave: true);
        return ObjectMapper.Map<SubscriptionPackage, SubscriptionPackageDto>(package);
    }

    [Authorize(ThabatPermissions.SubscriptionPackages.Edit)]
    public async Task<SubscriptionPackageDto> UpdateAsync(long id, CreateUpdateSubscriptionPackageDto input)
    {
        var package = await _packageRepository.GetAsync(id);
        ApplyInput(package, input);
        await EnsureUniquePeriodAsync(package.Period, id);
        await _packageRepository.UpdateAsync(package, autoSave: true);
        return ObjectMapper.Map<SubscriptionPackage, SubscriptionPackageDto>(package);
    }

    [Authorize(ThabatPermissions.SubscriptionPackages.Delete)]
    public async Task DeleteAsync(long id)
    {
        await _packageRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetSubscriptionPackagesInput input)
    {
        string? nameAr = null;
        string? nameEn = null;
        int? period = null;

        foreach (var filter in input.ColumnFilters ?? new List<SubscriptionPackageColumnFilterDto>())
        {
            var value = filter.Value?.Trim();
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (filter.ColumnName?.ToLowerInvariant())
            {
                case "namear":
                    nameAr = value;
                    break;
                case "nameen":
                    nameEn = value;
                    break;
                case "period":
                    if (int.TryParse(value, out var periodValue) && Enum.IsDefined(typeof(SubscriptionPeriod), periodValue))
                    {
                        period = periodValue;
                    }
                    break;
            }
        }

        return new Dictionary<string, object>
        {
            ["SkipCount"] = input.SkipCount < 0 ? 0 : input.SkipCount,
            ["MaxResultCount"] = input.MaxResultCount < 1 ? 10 : input.MaxResultCount,
            ["Sorting"] = string.IsNullOrWhiteSpace(input.Sorting) ? "Sort asc" : input.Sorting.Trim(),
            ["NameAr"] = (object?)nameAr ?? DBNull.Value,
            ["NameEn"] = (object?)nameEn ?? DBNull.Value,
            ["Period"] = period.HasValue ? period.Value : DBNull.Value
        };
    }

    private void ApplyInput(SubscriptionPackage package, CreateUpdateSubscriptionPackageDto input)
    {
        if (!Enum.IsDefined(typeof(SubscriptionPeriod), input.Period))
        {
            throw new UserFriendlyException(L["SubscriptionPackages:Validation.PeriodRequired"]);
        }

        var nameAr = input.NameAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nameAr))
        {
            throw new UserFriendlyException(L["SubscriptionPackages:Validation.NameArRequired"]);
        }

        if (input.Price < 0 || input.BilledPrice < 0 || input.OriginalPrice < 0)
        {
            throw new UserFriendlyException(L["SubscriptionPackages:Validation.PriceInvalid"]);
        }

        package.NameAr = nameAr;
        package.NameEn = string.IsNullOrWhiteSpace(input.NameEn) ? null : input.NameEn.Trim();
        package.DescriptionAr = string.IsNullOrWhiteSpace(input.DescriptionAr) ? null : input.DescriptionAr.Trim();
        package.DescriptionEn = string.IsNullOrWhiteSpace(input.DescriptionEn) ? null : input.DescriptionEn.Trim();
        package.Period = input.Period;
        package.Price = input.Price;
        package.BilledPrice = input.BilledPrice;
        package.OriginalPrice = input.OriginalPrice;
        package.Sort = input.Sort < 1 ? 1 : input.Sort;
        package.IsFeatured = input.IsFeatured;
    }

    private async Task EnsureUniquePeriodAsync(SubscriptionPeriod period, long? excludeId = null)
    {
        var exists = await _packageRepository.AnyAsync(x =>
            x.Period == period &&
            (!excludeId.HasValue || x.Id != excludeId.Value));

        if (exists)
        {
            throw new UserFriendlyException(L["SubscriptionPackages:Validation.DuplicatePeriod"]);
        }
    }

    private sealed class AdminSubscriptionPackagesGetPagedSpRow
    {
        public long Id { get; set; }
        public string? NameAr { get; set; }
        public string? NameEn { get; set; }
        public string? DescriptionAr { get; set; }
        public string? DescriptionEn { get; set; }
        public int Period { get; set; }
        public decimal Price { get; set; }
        public decimal BilledPrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public int Sort { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalPackages { get; set; }
        public int YearlyCount { get; set; }
        public int ThreeMonthsCount { get; set; }
        public int MonthlyCount { get; set; }
    }
}
