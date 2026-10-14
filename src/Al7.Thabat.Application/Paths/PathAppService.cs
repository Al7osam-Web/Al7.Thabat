using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Al7.Thabat.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Paths;

[RemoteService(false)]
public class PathAppService : ThabatAppService, IPathAppService
{
    private readonly IRepository<PathDay, long> _pathRepository;
    private readonly IRepository<PathEntry, long> _entryRepository;
    private readonly ICommonRepository _commonRepository;

    public PathAppService(
        IRepository<PathDay, long> pathRepository,
        IRepository<PathEntry, long> entryRepository,
        ICommonRepository commonRepository)
    {
        _pathRepository = pathRepository;
        _entryRepository = entryRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.Paths.Default)]
    public async Task<PathsPagedResultDto> GetPagedAsync(GetPathsInput input)
    {
        input ??= new GetPathsInput();

        var rows = await _commonRepository.GetListStoredProcedureAsync<AdminPathsGetPagedSpRow>(
            "AdminPathsGetPaged",
            BuildPagedParameters(input)) ?? new List<AdminPathsGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new PathDto
            {
                Id = row.Id,
                Stage = (TaskStage)row.Stage,
                Day = row.Day,
                FeelingsCount = row.FeelingsCount,
                ChallengesCount = row.ChallengesCount,
                TipsCount = row.TipsCount,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new PathsPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalPaths = first?.TotalPaths ?? 0,
            SevenDaysCount = first?.SevenDaysCount ?? 0,
            ThirtyDaysCount = first?.ThirtyDaysCount ?? 0,
            NinetyDaysCount = first?.NinetyDaysCount ?? 0
        };
    }

    [Authorize(ThabatPermissions.Paths.Default)]
    public async Task<PathDto> GetAsync(long id)
    {
        var path = await _pathRepository.GetAsync(id);
        var entries = await _entryRepository.GetListAsync(x => x.PathDayId == id);
        return MapPath(path, entries);
    }

    [Authorize(ThabatPermissions.Paths.Create)]
    public async Task<PathDto> CreateAsync(CreateUpdatePathDto input)
    {
        var path = new PathDay();
        ApplyInput(path, input);
        await EnsureUniqueStageDayAsync(path.Stage, path.Day);
        await _pathRepository.InsertAsync(path, autoSave: true);
        await ReplaceEntriesAsync(path.Id, input);
        return await GetAsync(path.Id);
    }

    [Authorize(ThabatPermissions.Paths.Edit)]
    public async Task<PathDto> UpdateAsync(long id, CreateUpdatePathDto input)
    {
        var path = await _pathRepository.GetAsync(id);
        ApplyInput(path, input);
        await EnsureUniqueStageDayAsync(path.Stage, path.Day, id);
        await _pathRepository.UpdateAsync(path, autoSave: true);
        await ReplaceEntriesAsync(id, input);
        return await GetAsync(id);
    }

    [Authorize(ThabatPermissions.Paths.Delete)]
    public async Task DeleteAsync(long id)
    {
        var entries = await _entryRepository.GetListAsync(x => x.PathDayId == id);
        foreach (var entry in entries)
        {
            await _entryRepository.DeleteAsync(entry);
        }

        await _pathRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetPathsInput input)
    {
        int? stage = null;
        int? day = null;

        foreach (var filter in input.ColumnFilters ?? new List<PathColumnFilterDto>())
        {
            var value = filter.Value?.Trim();
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (filter.ColumnName?.ToLowerInvariant())
            {
                case "stage":
                    if (int.TryParse(value, out var stageValue) && Enum.IsDefined(typeof(TaskStage), stageValue))
                    {
                        stage = stageValue;
                    }
                    break;
                case "day":
                    if (int.TryParse(value, out var dayValue))
                    {
                        day = dayValue;
                    }
                    break;
            }
        }

        return new Dictionary<string, object>
        {
            ["SkipCount"] = input.SkipCount < 0 ? 0 : input.SkipCount,
            ["MaxResultCount"] = input.MaxResultCount < 1 ? 10 : input.MaxResultCount,
            ["Sorting"] = NormalizeSorting(input.Sorting),
            ["Stage"] = stage.HasValue ? stage.Value : DBNull.Value,
            ["Day"] = day.HasValue ? day.Value : DBNull.Value
        };
    }

    private static string NormalizeSorting(string? sorting)
    {
        var value = (sorting ?? string.Empty).Trim().ToLowerInvariant().Replace("entity.", "");
        return value switch
        {
            "stage" or "stage asc" => "Stage asc",
            "stage desc" => "Stage desc",
            "day" or "day asc" => "Day asc",
            "day desc" => "Day desc",
            "feelingscount" or "feelingscount asc" => "FeelingsCount asc",
            "feelingscount desc" => "FeelingsCount desc",
            "challengescount" or "challengescount asc" => "ChallengesCount asc",
            "challengescount desc" => "ChallengesCount desc",
            "tipscount" or "tipscount asc" => "TipsCount asc",
            "tipscount desc" => "TipsCount desc",
            "creationtime" or "creationtime asc" => "CreationTime asc",
            "creationtime desc" => "CreationTime desc",
            _ => "Stage asc, Day asc"
        };
    }

    private void ApplyInput(PathDay path, CreateUpdatePathDto input)
    {
        if (!Enum.IsDefined(typeof(TaskStage), input.Stage))
        {
            throw new UserFriendlyException(L["Paths:Validation.StageRequired"]);
        }

        var maxDay = (int)input.Stage;
        if (input.Day < 1)
        {
            throw new UserFriendlyException(L["Paths:Validation.DayRequired"]);
        }

        if (input.Day > maxDay)
        {
            throw new UserFriendlyException(L["Paths:Validation.DayMax", maxDay]);
        }

        path.Stage = input.Stage;
        path.Day = input.Day;
    }

    private async Task EnsureUniqueStageDayAsync(TaskStage stage, int day, long? excludeId = null)
    {
        var exists = await _pathRepository.AnyAsync(x =>
            x.Stage == stage &&
            x.Day == day &&
            (!excludeId.HasValue || x.Id != excludeId.Value));

        if (exists)
        {
            throw new UserFriendlyException(L["Paths:Validation.DuplicateStageDay"]);
        }
    }

    private async Task ReplaceEntriesAsync(long pathDayId, CreateUpdatePathDto input)
    {
        var existing = await _entryRepository.GetListAsync(x => x.PathDayId == pathDayId);
        foreach (var item in existing)
        {
            await _entryRepository.DeleteAsync(item);
        }

        var entries = new List<PathEntry>();
        entries.AddRange(BuildEntries(pathDayId, PathSection.Feelings, input.Feelings, "Paths:Validation.FeelingsRequired"));
        entries.AddRange(BuildEntries(pathDayId, PathSection.Challenges, input.Challenges, "Paths:Validation.ChallengesRequired"));
        entries.AddRange(BuildEntries(pathDayId, PathSection.Tips, input.Tips, "Paths:Validation.TipsRequired"));

        foreach (var entry in entries)
        {
            await _entryRepository.InsertAsync(entry);
        }

        if (CurrentUnitOfWork != null)
        {
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }

    private List<PathEntry> BuildEntries(
        long pathDayId,
        PathSection section,
        List<PathEntryInputDto>? items,
        string requiredKey)
    {
        var ordered = (items ?? new List<PathEntryInputDto>())
            .Where(x => !string.IsNullOrWhiteSpace(x.DescriptionAr))
            .Select((x, index) => new PathEntry
            {
                PathDayId = pathDayId,
                Section = section,
                DescriptionAr = x.DescriptionAr.Trim(),
                DescriptionEn = string.IsNullOrWhiteSpace(x.DescriptionEn) ? null : x.DescriptionEn.Trim(),
                Sort = index + 1
            })
            .ToList();

        if (ordered.Count == 0)
        {
            throw new UserFriendlyException(L[requiredKey]);
        }

        return ordered;
    }

    private static PathDto MapPath(PathDay path, List<PathEntry> entries)
    {
        List<PathEntryDto> MapSection(PathSection section)
        {
            return entries
                .Where(x => x.Section == section)
                .OrderBy(x => x.Sort)
                .ThenBy(x => x.Id)
                .Select(x => new PathEntryDto
                {
                    DescriptionAr = x.DescriptionAr,
                    DescriptionEn = x.DescriptionEn,
                    Sort = x.Sort
                })
                .ToList();
        }

        var feelings = MapSection(PathSection.Feelings);
        var challenges = MapSection(PathSection.Challenges);
        var tips = MapSection(PathSection.Tips);

        return new PathDto
        {
            Id = path.Id,
            Stage = path.Stage,
            Day = path.Day,
            CreationTime = path.CreationTime,
            Feelings = feelings,
            Challenges = challenges,
            Tips = tips,
            FeelingsCount = feelings.Count,
            ChallengesCount = challenges.Count,
            TipsCount = tips.Count
        };
    }

    private sealed class AdminPathsGetPagedSpRow
    {
        public long Id { get; set; }
        public int Stage { get; set; }
        public int Day { get; set; }
        public int FeelingsCount { get; set; }
        public int ChallengesCount { get; set; }
        public int TipsCount { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalPaths { get; set; }
        public int SevenDaysCount { get; set; }
        public int ThirtyDaysCount { get; set; }
        public int NinetyDaysCount { get; set; }
    }
}
