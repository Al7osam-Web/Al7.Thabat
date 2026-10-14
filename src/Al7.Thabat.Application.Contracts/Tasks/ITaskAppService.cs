using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Tasks;

public interface ITaskAppService : IApplicationService
{
    Task<TasksPagedResultDto> GetPagedAsync(GetTasksInput input);
    Task<TaskDto> GetAsync(long id);
    Task<TaskDto> CreateAsync(CreateUpdateTaskDto input);
    Task<TaskDto> UpdateAsync(long id, CreateUpdateTaskDto input);
    Task DeleteAsync(long id);
}
