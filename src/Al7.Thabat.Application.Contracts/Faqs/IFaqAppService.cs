using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Faqs;

public interface IFaqAppService : IApplicationService
{
    Task<FaqsPagedResultDto> GetPagedAsync(GetFaqsInput input);
    Task<FaqDto> GetAsync(long id);
    Task<FaqDto> CreateAsync(CreateUpdateFaqDto input);
    Task<FaqDto> UpdateAsync(long id, CreateUpdateFaqDto input);
    Task DeleteAsync(long id);
}
