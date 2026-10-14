using System.Threading.Tasks;
using Al7.Thabat.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Tasks;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/tasks")]
[Produces("application/json")]
public class TasksController : ThabatController
{
    private readonly ITaskAppService _taskAppService;

    public TasksController(ITaskAppService taskAppService)
    {
        _taskAppService = taskAppService;
    }

    [HttpPost("paged")]
    public Task<TasksPagedResultDto> GetPagedAsync([FromBody] GetTasksInput input)
    {
        return _taskAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<TaskDto> GetAsync(long id)
    {
        return _taskAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<TaskDto> CreateAsync([FromBody] CreateUpdateTaskDto input)
    {
        return _taskAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<TaskDto> UpdateAsync(long id, [FromBody] CreateUpdateTaskDto input)
    {
        return _taskAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _taskAppService.DeleteAsync(id);
    }
}
