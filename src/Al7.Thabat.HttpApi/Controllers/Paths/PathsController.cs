using System.Threading.Tasks;
using Al7.Thabat.Paths;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Paths;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/paths")]
[Produces("application/json")]
public class PathsController : ThabatController
{
    private readonly IPathAppService _pathAppService;

    public PathsController(IPathAppService pathAppService)
    {
        _pathAppService = pathAppService;
    }

    [HttpPost("paged")]
    public Task<PathsPagedResultDto> GetPagedAsync([FromBody] GetPathsInput input)
    {
        return _pathAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<PathDto> GetAsync(long id)
    {
        return _pathAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<PathDto> CreateAsync([FromBody] CreateUpdatePathDto input)
    {
        return _pathAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<PathDto> UpdateAsync(long id, [FromBody] CreateUpdatePathDto input)
    {
        return _pathAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _pathAppService.DeleteAsync(id);
    }
}
