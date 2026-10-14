using System.Threading.Tasks;
using Al7.Thabat.Faqs;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Faqs;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/faqs")]
[Produces("application/json")]
public class FaqsController : ThabatController
{
    private readonly IFaqAppService _faqAppService;

    public FaqsController(IFaqAppService faqAppService)
    {
        _faqAppService = faqAppService;
    }

    [HttpPost("paged")]
    public Task<FaqsPagedResultDto> GetPagedAsync([FromBody] GetFaqsInput input)
    {
        return _faqAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<FaqDto> GetAsync(long id)
    {
        return _faqAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<FaqDto> CreateAsync([FromBody] CreateUpdateFaqDto input)
    {
        return _faqAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<FaqDto> UpdateAsync(long id, [FromBody] CreateUpdateFaqDto input)
    {
        return _faqAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _faqAppService.DeleteAsync(id);
    }
}
