using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Surveys;

public class SurveyAnswerDto : EntityDto<long>
{
    public string? TitleAr { get; set; }
    public string? TitleEn { get; set; }
    public decimal Degree { get; set; }
    public int Sort { get; set; }
}

public class SurveyAnswerInputDto
{
    [Required]
    [StringLength(512)]
    public string TitleAr { get; set; } = string.Empty;

    [StringLength(512)]
    public string? TitleEn { get; set; }

    public decimal Degree { get; set; }

    public int Sort { get; set; }
}

public class SurveyQuestionDto : EntityDto<long>
{
    public string? TitleAr { get; set; }
    public string? TitleEn { get; set; }
    public int Sort { get; set; }
    public int AnswersCount { get; set; }
    public DateTime CreationTime { get; set; }
    public List<SurveyAnswerDto> Answers { get; set; } = new();
}

public class CreateUpdateSurveyQuestionDto
{
    [Required]
    [StringLength(512)]
    public string TitleAr { get; set; } = string.Empty;

    [StringLength(512)]
    public string? TitleEn { get; set; }

    public int Sort { get; set; }

    /// <summary>
    /// Null keeps existing answers; empty list clears answers.
    /// </summary>
    public List<SurveyAnswerInputDto>? Answers { get; set; }
}

public class SurveyQuestionColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetSurveyQuestionsInput : PagedAndSortedResultRequestDto
{
    public List<SurveyQuestionColumnFilterDto>? ColumnFilters { get; set; }
}

public class SurveyQuestionsPagedResultDto
{
    public long TotalCount { get; set; }
    public List<SurveyQuestionDto> Items { get; set; } = new();
    public int TotalQuestions { get; set; }
    public int TotalAnswers { get; set; }
}
