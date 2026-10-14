using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Tasks;

[RemoteService(false)]
public class TaskAppService : ThabatAppService, ITaskAppService
{
    private readonly IRepository<TaskItem, long> _taskRepository;
    private readonly IRepository<TaskRegistration, long> _taskRegistrationRepository;
    private readonly ICommonRepository _commonRepository;

    public TaskAppService(
        IRepository<TaskItem, long> taskRepository,
        IRepository<TaskRegistration, long> taskRegistrationRepository,
        ICommonRepository commonRepository)
    {
        _taskRepository = taskRepository;
        _taskRegistrationRepository = taskRegistrationRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.Tasks.Default)]
    public async Task<TasksPagedResultDto> GetPagedAsync(GetTasksInput input)
    {
        input ??= new GetTasksInput();

        var rows = await _commonRepository.GetListStoredProcedureAsync<AdminTasksGetPagedSpRow>(
            "AdminTasksGetPaged",
            BuildPagedParameters(input)) ?? new List<AdminTasksGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new TaskDto
            {
                Id = row.Id,
                Stage = (TaskStage)row.Stage,
                TitleAr = row.TitleAr,
                TitleEn = row.TitleEn,
                SubTitleAr = row.SubTitleAr,
                SubTitleEn = row.SubTitleEn,
                Day = row.Day,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new TasksPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalTasks = first?.TotalTasks ?? 0,
            SevenDaysCount = first?.SevenDaysCount ?? 0,
            ThirtyDaysCount = first?.ThirtyDaysCount ?? 0,
            NinetyDaysCount = first?.NinetyDaysCount ?? 0
        };
    }

    [Authorize(ThabatPermissions.Tasks.Default)]
    public async Task<TaskDto> GetAsync(long id)
    {
        var task = await _taskRepository.GetAsync(id);
        return ObjectMapper.Map<TaskItem, TaskDto>(task);
    }

    [Authorize(ThabatPermissions.Tasks.Create)]
    public async Task<TaskDto> CreateAsync(CreateUpdateTaskDto input)
    {
        var task = new TaskItem();
        ApplyInput(task, input);
        await EnsureUniqueStageDayAsync(task.Stage, task.Day);
        await _taskRepository.InsertAsync(task, autoSave: true);
        return ObjectMapper.Map<TaskItem, TaskDto>(task);
    }

    [Authorize(ThabatPermissions.Tasks.Edit)]
    public async Task<TaskDto> UpdateAsync(long id, CreateUpdateTaskDto input)
    {
        var task = await _taskRepository.GetAsync(id);
        ApplyInput(task, input);
        await EnsureUniqueStageDayAsync(task.Stage, task.Day, id);
        await _taskRepository.UpdateAsync(task, autoSave: true);
        return ObjectMapper.Map<TaskItem, TaskDto>(task);
    }

    [Authorize(ThabatPermissions.Tasks.Delete)]
    public async Task DeleteAsync(long id)
    {
        if (await _taskRegistrationRepository.AnyAsync(x => x.TaskId == id))
        {
            throw new UserFriendlyException(L["Tasks:DeleteBlocked"]);
        }

        await _taskRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetTasksInput input)
    {
        string? titleAr = null;
        string? titleEn = null;
        int? stage = null;
        int? day = null;

        foreach (var filter in input.ColumnFilters ?? new List<TaskColumnFilterDto>())
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
            ["Sorting"] = string.IsNullOrWhiteSpace(input.Sorting) ? "CreationTime desc" : input.Sorting.Trim(),
            ["TitleAr"] = (object?)titleAr ?? DBNull.Value,
            ["TitleEn"] = (object?)titleEn ?? DBNull.Value,
            ["Stage"] = stage.HasValue ? stage.Value : DBNull.Value,
            ["Day"] = day.HasValue ? day.Value : DBNull.Value
        };
    }

    private void ApplyInput(TaskItem task, CreateUpdateTaskDto input)
    {
        if (!Enum.IsDefined(typeof(TaskStage), input.Stage))
        {
            throw new UserFriendlyException(L["Tasks:Validation.StageRequired"]);
        }

        var titleAr = input.TitleAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(titleAr))
        {
            throw new UserFriendlyException(L["Tasks:Validation.TitleArRequired"]);
        }

        var maxDay = (int)input.Stage;
        if (input.Day < 1)
        {
            throw new UserFriendlyException(L["Tasks:Validation.DayRequired"]);
        }

        if (input.Day > maxDay)
        {
            throw new UserFriendlyException(L["Tasks:Validation.DayMax", maxDay]);
        }

        task.Stage = input.Stage;
        task.TitleAr = titleAr;
        task.TitleEn = string.IsNullOrWhiteSpace(input.TitleEn) ? null : input.TitleEn.Trim();
        task.SubTitleAr = string.IsNullOrWhiteSpace(input.SubTitleAr) ? null : input.SubTitleAr.Trim();
        task.SubTitleEn = string.IsNullOrWhiteSpace(input.SubTitleEn) ? null : input.SubTitleEn.Trim();
        task.Day = input.Day;
    }

    private async Task EnsureUniqueStageDayAsync(TaskStage stage, int day, long? excludeId = null)
    {
        var exists = await _taskRepository.AnyAsync(x =>
            x.Stage == stage &&
            x.Day == day &&
            (!excludeId.HasValue || x.Id != excludeId.Value));

        if (exists)
        {
            throw new UserFriendlyException(L["Tasks:Validation.DuplicateStageDay"]);
        }
    }

    private sealed class AdminTasksGetPagedSpRow
    {
        public long Id { get; set; }
        public int Stage { get; set; }
        public string? TitleAr { get; set; }
        public string? TitleEn { get; set; }
        public string? SubTitleAr { get; set; }
        public string? SubTitleEn { get; set; }
        public int Day { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalTasks { get; set; }
        public int SevenDaysCount { get; set; }
        public int ThirtyDaysCount { get; set; }
        public int NinetyDaysCount { get; set; }
    }
}
