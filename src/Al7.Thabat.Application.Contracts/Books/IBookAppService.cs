using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.Books;

public interface IBookAppService : IApplicationService
{
    Task<BooksPagedResultDto> GetPagedAsync(GetBooksInput input);
    Task<BookDto> GetAsync(long id);
    Task<BookDto> CreateAsync(CreateUpdateBookDto input);
    Task<BookDto> UpdateAsync(long id, CreateUpdateBookDto input);
    Task DeleteAsync(long id);
}
