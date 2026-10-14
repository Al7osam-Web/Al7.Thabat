using System.Threading.Tasks;
using Al7.Thabat.Surveys;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Surveys;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/survey-questions")]
[Produces("application/json")]
public class SurveyQuestionsController : ThabatController
{
    private readonly ISurveyQuestionAppService _surveyQuestionAppService;

    public SurveyQuestionsController(ISurveyQuestionAppService surveyQuestionAppService)
    {
        _surveyQuestionAppService = surveyQuestionAppService;
    }

    [HttpPost("paged")]
    public Task<SurveyQuestionsPagedResultDto> GetPagedAsync([FromBody] GetSurveyQuestionsInput input)
    {
        return _surveyQuestionAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<SurveyQuestionDto> GetAsync(long id)
    {
        return _surveyQuestionAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<SurveyQuestionDto> CreateAsync([FromBody] CreateUpdateSurveyQuestionDto input)
    {
        return _surveyQuestionAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<SurveyQuestionDto> UpdateAsync(long id, [FromBody] CreateUpdateSurveyQuestionDto input)
    {
        return _surveyQuestionAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _surveyQuestionAppService.DeleteAsync(id);
    }
}
