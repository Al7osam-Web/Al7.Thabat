using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Books;

public class BookMediaDto : EntityDto<long>
{
    public string? FilePath { get; set; }
    public int Sort { get; set; }
}

public class BookMediaInputDto
{
    [Required]
    [StringLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public int Sort { get; set; }
}

public class BookDto : EntityDto<long>
{
    public bool IsRelapse { get; set; }
    public string? NameAr { get; set; }
    public string? NameEn { get; set; }
    public string? CoverImage { get; set; }
    public bool IsFree { get; set; }
    public DateTime CreationTime { get; set; }
    public List<BookMediaDto> Media { get; set; } = new();
}

public class CreateUpdateBookDto
{
    [Required]
    [StringLength(256)]
    public string NameAr { get; set; } = string.Empty;

    [StringLength(256)]
    public string? NameEn { get; set; }

    [StringLength(500)]
    public string? CoverImage { get; set; }

    public bool IsFree { get; set; }

    public bool IsRelapse { get; set; }

    /// <summary>
    /// Null keeps existing media; empty list clears media.
    /// </summary>
    public List<BookMediaInputDto>? MediaItems { get; set; }
}

public class BookColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetBooksInput : PagedAndSortedResultRequestDto
{
    public List<BookColumnFilterDto>? ColumnFilters { get; set; }
}

public class BooksPagedResultDto
{
    public long TotalCount { get; set; }
    public List<BookDto> Items { get; set; } = new();
    public int TotalBooks { get; set; }
    public int AvailableBooks { get; set; }
    public int FreeBooks { get; set; }
    public int RelapseBooks { get; set; }
}
