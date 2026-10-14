using System.Threading.Tasks;
using Al7.Thabat.Books;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace Al7.Thabat.Controllers.Books;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/books")]
[Produces("application/json")]
public class BooksController : ThabatController
{
    private readonly IBookAppService _bookAppService;

    public BooksController(IBookAppService bookAppService)
    {
        _bookAppService = bookAppService;
    }

    [HttpPost("paged")]
    public Task<BooksPagedResultDto> GetPagedAsync([FromBody] GetBooksInput input)
    {
        return _bookAppService.GetPagedAsync(input);
    }

    [HttpGet("{id}")]
    public Task<BookDto> GetAsync(long id)
    {
        return _bookAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<BookDto> CreateAsync([FromBody] CreateUpdateBookDto input)
    {
        return _bookAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<BookDto> UpdateAsync(long id, [FromBody] CreateUpdateBookDto input)
    {
        return _bookAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(long id)
    {
        return _bookAppService.DeleteAsync(id);
    }
}
