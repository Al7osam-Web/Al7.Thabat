using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Clients;

public interface IClientAppService : IApplicationService
{
    Task<PagedResultDto<ClientDto>> GetPagedAsync(GetClientsInput input);
    Task<ClientDto> GetAsync(long id);
    Task<ClientDto> CreateAsync(CreateUpdateClientDto input);
    Task<ClientDto> UpdateAsync(long id, CreateUpdateClientDto input);
    Task DeleteAsync(long id);
}
