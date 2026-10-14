using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Surveys;

[RemoteService(false)]
public class SurveyQuestionAppService : ThabatAppService, ISurveyQuestionAppService
{
    private readonly IRepository<SurveyQuestion, long> _questionRepository;
    private readonly IRepository<SurveyAnswer, long> _answerRepository;
    private readonly ICommonRepository _commonRepository;

    public SurveyQuestionAppService(
        IRepository<SurveyQuestion, long> questionRepository,
        IRepository<SurveyAnswer, long> answerRepository,
        ICommonRepository commonRepository)
    {
        _questionRepository = questionRepository;
        _answerRepository = answerRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.SurveyQuestions.Default)]
    public async Task<SurveyQuestionsPagedResultDto> GetPagedAsync(GetSurveyQuestionsInput input)
    {
        input ??= new GetSurveyQuestionsInput();

        var rows = await _commonRepository.GetListStoredProcedureAsync<AdminSurveyQuestionsGetPagedSpRow>(
            "AdminSurveyQuestionsGetPaged",
            BuildPagedParameters(input)) ?? new List<AdminSurveyQuestionsGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new SurveyQuestionDto
            {
                Id = row.Id,
                TitleAr = row.TitleAr,
                TitleEn = row.TitleEn,
                Sort = row.Sort,
                AnswersCount = row.AnswersCount,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new SurveyQuestionsPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalQuestions = first?.TotalQuestions ?? 0,
            TotalAnswers = first?.TotalAnswers ?? 0
        };
    }

    [Authorize(ThabatPermissions.SurveyQuestions.Default)]
    public async Task<SurveyQuestionDto> GetAsync(long id)
    {
        var question = await _questionRepository.GetAsync(id);
        var dto = ObjectMapper.Map<SurveyQuestion, SurveyQuestionDto>(question);
        var answers = await _answerRepository.GetListAsync(x => x.SurveyQuestionId == id);
        dto.Answers = ObjectMapper.Map<List<SurveyAnswer>, List<SurveyAnswerDto>>(
            answers.OrderBy(x => x.Sort).ThenBy(x => x.Id).ToList());
        dto.AnswersCount = dto.Answers.Count;
        return dto;
    }

    [Authorize(ThabatPermissions.SurveyQuestions.Create)]
    public async Task<SurveyQuestionDto> CreateAsync(CreateUpdateSurveyQuestionDto input)
    {
        var question = new SurveyQuestion();
        ApplyInput(question, input);
        await EnsureUniqueSortAsync(question.Sort);
        await _questionRepository.InsertAsync(question, autoSave: true);

        if (input.Answers != null)
        {
            await ReplaceAnswersAsync(question.Id, input.Answers);
        }

        return await GetAsync(question.Id);
    }

    [Authorize(ThabatPermissions.SurveyQuestions.Edit)]
    public async Task<SurveyQuestionDto> UpdateAsync(long id, CreateUpdateSurveyQuestionDto input)
    {
        var question = await _questionRepository.GetAsync(id);
        ApplyInput(question, input);
        await EnsureUniqueSortAsync(question.Sort, id);
        await _questionRepository.UpdateAsync(question, autoSave: true);

        if (input.Answers != null)
        {
            await ReplaceAnswersAsync(id, input.Answers);
        }

        return await GetAsync(id);
    }

    [Authorize(ThabatPermissions.SurveyQuestions.Delete)]
    public async Task DeleteAsync(long id)
    {
        await _questionRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetSurveyQuestionsInput input)
    {
        string? titleAr = null;
        string? titleEn = null;
        int? sort = null;

        foreach (var filter in input.ColumnFilters ?? new List<SurveyQuestionColumnFilterDto>())
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

    private void ApplyInput(SurveyQuestion question, CreateUpdateSurveyQuestionDto input)
    {
        var titleAr = input.TitleAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(titleAr))
        {
            throw new UserFriendlyException(L["SurveyQuestions:Validation.TitleArRequired"]);
        }

        if (input.Sort < 1)
        {
            throw new UserFriendlyException(L["SurveyQuestions:Validation.SortRequired"]);
        }

        question.TitleAr = titleAr;
        question.TitleEn = string.IsNullOrWhiteSpace(input.TitleEn) ? null : input.TitleEn.Trim();
        question.Sort = input.Sort;
    }

    private async Task EnsureUniqueSortAsync(int sort, long? excludeId = null)
    {
        var exists = await _questionRepository.AnyAsync(x =>
            x.Sort == sort &&
            (!excludeId.HasValue || x.Id != excludeId.Value));

        if (exists)
        {
            throw new UserFriendlyException(L["SurveyQuestions:Validation.DuplicateSort"]);
        }
    }

    private async Task ReplaceAnswersAsync(long questionId, List<SurveyAnswerInputDto> answers)
    {
        var existing = await _answerRepository.GetListAsync(x => x.SurveyQuestionId == questionId);
        foreach (var item in existing)
        {
            await _answerRepository.DeleteAsync(item);
        }

        var ordered = answers
            .Where(x => !string.IsNullOrWhiteSpace(x.TitleAr))
            .Select((x, index) => new
            {
                TitleAr = x.TitleAr.Trim(),
                TitleEn = string.IsNullOrWhiteSpace(x.TitleEn) ? null : x.TitleEn.Trim(),
                Degree = x.Degree,
                Sort = x.Sort > 0 ? x.Sort : index + 1
            })
            .OrderBy(x => x.Sort)
            .Select((x, index) => new SurveyAnswer
            {
                SurveyQuestionId = questionId,
                TitleAr = x.TitleAr,
                TitleEn = x.TitleEn,
                Degree = x.Degree,
                Sort = index + 1
            })
            .ToList();

        if (ordered.Count == 0)
        {
            throw new UserFriendlyException(L["SurveyQuestions:Validation.AnswersRequired"]);
        }

        foreach (var answer in ordered)
        {
            await _answerRepository.InsertAsync(answer);
        }

        if (CurrentUnitOfWork != null)
        {
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }

    private sealed class AdminSurveyQuestionsGetPagedSpRow
    {
        public long Id { get; set; }
        public string? TitleAr { get; set; }
        public string? TitleEn { get; set; }
        public int Sort { get; set; }
        public int AnswersCount { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalAnswers { get; set; }
    }
}
