using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Faqs;

[RemoteService(false)]
public class FaqAppService : ThabatAppService, IFaqAppService
{
    private readonly IRepository<Faq, long> _faqRepository;
    private readonly ICommonRepository _commonRepository;

    public FaqAppService(
        IRepository<Faq, long> faqRepository,
        ICommonRepository commonRepository)
    {
        _faqRepository = faqRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.Faqs.Default)]
    public async Task<FaqsPagedResultDto> GetPagedAsync(GetFaqsInput input)
    {
        input ??= new GetFaqsInput();

        var rows = await _commonRepository.GetListStoredProcedureAsync<AdminFaqsGetPagedSpRow>(
            "AdminFaqsGetPaged",
            BuildPagedParameters(input)) ?? new List<AdminFaqsGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new FaqDto
            {
                Id = row.Id,
                TitleAr = row.TitleAr,
                TitleEn = row.TitleEn,
                DescriptionAr = row.DescriptionAr,
                DescriptionEn = row.DescriptionEn,
                Sort = row.Sort,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new FaqsPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalFaqs = first?.TotalFaqs ?? 0
        };
    }

    [Authorize(ThabatPermissions.Faqs.Default)]
    public async Task<FaqDto> GetAsync(long id)
    {
        var faq = await _faqRepository.GetAsync(id);
        return ObjectMapper.Map<Faq, FaqDto>(faq);
    }

    [Authorize(ThabatPermissions.Faqs.Create)]
    public async Task<FaqDto> CreateAsync(CreateUpdateFaqDto input)
    {
        var faq = new Faq();
        ApplyInput(faq, input);
        await EnsureUniqueSortAsync(faq.Sort);
        await _faqRepository.InsertAsync(faq, autoSave: true);
        return ObjectMapper.Map<Faq, FaqDto>(faq);
    }

    [Authorize(ThabatPermissions.Faqs.Edit)]
    public async Task<FaqDto> UpdateAsync(long id, CreateUpdateFaqDto input)
    {
        var faq = await _faqRepository.GetAsync(id);
        ApplyInput(faq, input);
        await EnsureUniqueSortAsync(faq.Sort, id);
        await _faqRepository.UpdateAsync(faq, autoSave: true);
        return ObjectMapper.Map<Faq, FaqDto>(faq);
    }

    [Authorize(ThabatPermissions.Faqs.Delete)]
    public async Task DeleteAsync(long id)
    {
        await _faqRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetFaqsInput input)
    {
        string? titleAr = null;
        string? titleEn = null;
        int? sort = null;

        foreach (var filter in input.ColumnFilters ?? new List<FaqColumnFilterDto>())
        {
            var value = filter.Value?.Trim();
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (filter.ColumnName?.ToLowerInvariant())
            {
                case "titlear":
                    titleAr = value;
                    break;
                case "titleen":
                    titleEn = value;
                    break;
                case "sort":
                    if (int.TryParse(value, out var sortValue))
                    {
                        sort = sortValue;
                    }
                    break;
            }
        }

        return new Dictionary<string, object>
        {
            ["SkipCount"] = input.SkipCount < 0 ? 0 : input.SkipCount,
            ["MaxResultCount"] = input.MaxResultCount < 1 ? 10 : input.MaxResultCount,
            ["Sorting"] = string.IsNullOrWhiteSpace(input.Sorting) ? "Sort asc" : input.Sorting.Trim(),
            ["TitleAr"] = (object?)titleAr ?? DBNull.Value,
            ["TitleEn"] = (object?)titleEn ?? DBNull.Value,
            ["Sort"] = sort.HasValue ? sort.Value : DBNull.Value
        };
    }

    private void ApplyInput(Faq faq, CreateUpdateFaqDto input)
    {
        var titleAr = input.TitleAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(titleAr))
        {
            throw new UserFriendlyException(L["Faqs:Validation.TitleArRequired"]);
        }

        var descriptionAr = input.DescriptionAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(descriptionAr))
        {
            throw new UserFriendlyException(L["Faqs:Validation.DescriptionArRequired"]);
        }

        if (input.Sort < 1)
        {
            throw new UserFriendlyException(L["Faqs:Validation.SortRequired"]);
        }

        faq.TitleAr = titleAr;
        faq.TitleEn = string.IsNullOrWhiteSpace(input.TitleEn) ? null : input.TitleEn.Trim();
        faq.DescriptionAr = descriptionAr;
        faq.DescriptionEn = string.IsNullOrWhiteSpace(input.DescriptionEn) ? null : input.DescriptionEn.Trim();
        faq.Sort = input.Sort;
    }

    private async Task EnsureUniqueSortAsync(int sort, long? excludeId = null)
    {
        var exists = await _faqRepository.AnyAsync(x =>
            x.Sort == sort &&
            (!excludeId.HasValue || x.Id != excludeId.Value));

        if (exists)
        {
            throw new UserFriendlyException(L["Faqs:Validation.DuplicateSort"]);
        }
    }

    private sealed class AdminFaqsGetPagedSpRow
    {
        public long Id { get; set; }
        public string? TitleAr { get; set; }
        public string? TitleEn { get; set; }
        public string? DescriptionAr { get; set; }
        public string? DescriptionEn { get; set; }
        public int Sort { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalFaqs { get; set; }
    }
}
