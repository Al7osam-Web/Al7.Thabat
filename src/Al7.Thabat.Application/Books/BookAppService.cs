using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Books;

[RemoteService(false)]
public class BookAppService : ThabatAppService, IBookAppService
{
    private readonly IRepository<Book, long> _bookRepository;
    private readonly IRepository<BookMedia, long> _bookMediaRepository;
    private readonly ICommonRepository _commonRepository;

    public BookAppService(
        IRepository<Book, long> bookRepository,
        IRepository<BookMedia, long> bookMediaRepository,
        ICommonRepository commonRepository)
    {
        _bookRepository = bookRepository;
        _bookMediaRepository = bookMediaRepository;
        _commonRepository = commonRepository;
    }

    [Authorize(ThabatPermissions.Books.Default)]
    public async Task<BooksPagedResultDto> GetPagedAsync(GetBooksInput input)
    {
        input ??= new GetBooksInput();

        var parameters = BuildPagedParameters(input);
        var rows = await _commonRepository.GetListStoredProcedureAsync<BooksGetPagedSpRow>(
            "AdminBooksGetPaged",
            parameters) ?? new List<BooksGetPagedSpRow>();

        var first = rows.FirstOrDefault();
        var items = rows
            .Where(row => row.Id > 0)
            .Select(row => new BookDto
            {
                Id = row.Id,
                NameAr = row.NameAr,
                NameEn = row.NameEn,
                CoverImage = row.CoverImage,
                IsFree = row.IsFree,
                IsRelapse = row.IsRelapse,
                CreationTime = row.CreationTime
            })
            .ToList();

        return new BooksPagedResultDto
        {
            TotalCount = first?.TotalCount ?? 0,
            Items = items,
            TotalBooks = first?.TotalBooks ?? 0,
            AvailableBooks = first?.AvailableBooks ?? 0,
            FreeBooks = first?.FreeBooks ?? 0,
            RelapseBooks = first?.RelapseBooks ?? 0
        };
    }

    [Authorize(ThabatPermissions.Books.Default)]
    public async Task<BookDto> GetAsync(long id)
    {
        var book = await _bookRepository.GetAsync(id);
        var dto = ObjectMapper.Map<Book, BookDto>(book);
        var mediaQuery = await _bookMediaRepository.GetQueryableAsync();
        var media = await AsyncExecuter.ToListAsync(
            mediaQuery.Where(x => x.BookId == id).OrderBy(x => x.Sort).ThenBy(x => x.Id));
        dto.Media = ObjectMapper.Map<List<BookMedia>, List<BookMediaDto>>(media);
        return dto;
    }

    [Authorize(ThabatPermissions.Books.Create)]
    public async Task<BookDto> CreateAsync(CreateUpdateBookDto input)
    {
        var book = new Book();
        ApplyInput(book, input);
        await _bookRepository.InsertAsync(book, autoSave: true);

        if (input.MediaItems != null)
        {
            await ReplaceMediaAsync(book.Id, input.MediaItems);
        }

        return await GetAsync(book.Id);
    }

    [Authorize(ThabatPermissions.Books.Edit)]
    public async Task<BookDto> UpdateAsync(long id, CreateUpdateBookDto input)
    {
        var book = await _bookRepository.GetAsync(id);
        ApplyInput(book, input);
        await _bookRepository.UpdateAsync(book, autoSave: true);

        if (input.MediaItems != null)
        {
            await ReplaceMediaAsync(id, input.MediaItems);
        }

        return await GetAsync(id);
    }

    [Authorize(ThabatPermissions.Books.Delete)]
    public async Task DeleteAsync(long id)
    {
        await _bookRepository.DeleteAsync(id);
    }

    private static Dictionary<string, object> BuildPagedParameters(GetBooksInput input)
    {
        string? nameAr = null;
        string? nameEn = null;
        bool? isFree = null;
        bool? isRelapse = null;

        foreach (var filter in input.ColumnFilters ?? new List<BookColumnFilterDto>())
        {
            var value = filter.Value?.Trim();
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (filter.ColumnName?.ToLowerInvariant())
            {
                case "namear":
                    nameAr = value;
                    break;
                case "nameen":
                    nameEn = value;
                    break;
                case "isfree":
                    if (bool.TryParse(value, out var free))
                    {
                        isFree = free;
                    }
                    break;
                case "isrelapse":
                    if (bool.TryParse(value, out var relapse))
                    {
                        isRelapse = relapse;
                    }
                    break;
            }
        }

        return new Dictionary<string, object>
        {
            ["SkipCount"] = input.SkipCount < 0 ? 0 : input.SkipCount,
            ["MaxResultCount"] = input.MaxResultCount < 1 ? 10 : input.MaxResultCount,
            ["Sorting"] = string.IsNullOrWhiteSpace(input.Sorting) ? "CreationTime desc" : input.Sorting.Trim(),
            ["NameAr"] = (object?)nameAr ?? DBNull.Value,
            ["NameEn"] = (object?)nameEn ?? DBNull.Value,
            ["IsFree"] = isFree.HasValue ? isFree.Value : DBNull.Value,
            ["IsRelapse"] = isRelapse.HasValue ? isRelapse.Value : DBNull.Value
        };
    }

    private void ApplyInput(Book book, CreateUpdateBookDto input)
    {
        var nameAr = input.NameAr?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(nameAr))
        {
            throw new UserFriendlyException(L["Books:Validation.NameArRequired"]);
        }

        book.NameAr = nameAr;
        book.NameEn = string.IsNullOrWhiteSpace(input.NameEn) ? null : input.NameEn.Trim();
        book.CoverImage = string.IsNullOrWhiteSpace(input.CoverImage) ? null : input.CoverImage.Trim();
        book.IsFree = input.IsFree;
        book.IsRelapse = input.IsRelapse;
    }

    private async Task ReplaceMediaAsync(long bookId, List<BookMediaInputDto> mediaItems)
    {
        var existing = await _bookMediaRepository.GetListAsync(x => x.BookId == bookId);
        foreach (var item in existing)
        {
            await _bookMediaRepository.DeleteAsync(item);
        }

        var orderedItems = mediaItems
            .Where(x => !string.IsNullOrWhiteSpace(x.FilePath))
            .Select((x, index) => new
            {
                FilePath = x.FilePath.Trim(),
                Sort = x.Sort > 0 ? x.Sort : index + 1
            })
            .GroupBy(x => x.FilePath, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderBy(x => x.Sort).First())
            .OrderBy(x => x.Sort)
            .Select((x, index) => new BookMedia
            {
                BookId = bookId,
                FilePath = x.FilePath,
                Sort = index + 1
            })
            .ToList();

        foreach (var media in orderedItems)
        {
            await _bookMediaRepository.InsertAsync(media);
        }

        // Ensure subsequent GetAsync sees the replaced media in the same request.
        if (CurrentUnitOfWork != null)
        {
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }

    private sealed class BooksGetPagedSpRow
    {
        public long Id { get; set; }
        public string? NameAr { get; set; }
        public string? NameEn { get; set; }
        public string? CoverImage { get; set; }
        public bool IsFree { get; set; }
        public bool IsRelapse { get; set; }
        public DateTime CreationTime { get; set; }
        public int TotalCount { get; set; }
        public int TotalBooks { get; set; }
        public int AvailableBooks { get; set; }
        public int FreeBooks { get; set; }
        public int RelapseBooks { get; set; }
    }
}
