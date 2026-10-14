using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Paths;

public interface IPathAppService : IApplicationService
{
    Task<PathsPagedResultDto> GetPagedAsync(GetPathsInput input);
    Task<PathDto> GetAsync(long id);
    Task<PathDto> CreateAsync(CreateUpdatePathDto input);
    Task<PathDto> UpdateAsync(long id, CreateUpdatePathDto input);
    Task DeleteAsync(long id);
}
