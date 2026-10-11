using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace Al7.Thabat.Clients;

public class ClientDto : EntityDto<long>
{
    public string? Name { get; set; }
    public string? EmailAddress { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreationTime { get; set; }
}

public class CreateUpdateClientDto
{
    [Required]
    [StringLength(128)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(256)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    [StringLength(16)]
    public string PhoneNumber { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public class ClientColumnFilterDto
{
    public string? ColumnName { get; set; }
    public string? Value { get; set; }
    public string? MatchMode { get; set; }
}

public class GetClientsInput : PagedAndSortedResultRequestDto
{
    public List<ClientColumnFilterDto>? ColumnFilters { get; set; }
}
