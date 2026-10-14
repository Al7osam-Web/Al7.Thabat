using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Surveys;

public interface ISurveyQuestionAppService : IApplicationService
{
    Task<SurveyQuestionsPagedResultDto> GetPagedAsync(GetSurveyQuestionsInput input);
    Task<SurveyQuestionDto> GetAsync(long id);
    Task<SurveyQuestionDto> CreateAsync(CreateUpdateSurveyQuestionDto input);
    Task<SurveyQuestionDto> UpdateAsync(long id, CreateUpdateSurveyQuestionDto input);
    Task DeleteAsync(long id);
}
