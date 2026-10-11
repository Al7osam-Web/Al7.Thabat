using System.Threading.Tasks;
using Al7.Thabat.Clients;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Controllers.Clients;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/clients")]
[Produces("application/json")]
public class ClientsController : ThabatController
{
    private readonly IClientAppService _clientAppService;

    public ClientsController(IClientAppService clientAppService)
    {
        _clientAppService = clientAppService;
    }

    [HttpPost("paged")]
    public Task<PagedResultDto<ClientDto>> GetPagedAsync([FromBody] GetClientsInput input)
    {
        return _clientAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<ClientDto> GetAsync(long id)
    {
        return _clientAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<ClientDto> CreateAsync([FromBody] CreateUpdateClientDto input)
    {
        return _clientAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<ClientDto> UpdateAsync(long id, [FromBody] CreateUpdateClientDto input)
    {
        return _clientAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _clientAppService.DeleteAsync(id);
    }
}
