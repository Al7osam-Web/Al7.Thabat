using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Al7.Thabat.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Clients;

[RemoteService(false)]
public class ClientAppService : ThabatAppService, IClientAppService
{
    private static readonly Regex PhonePattern = new(@"^5\d{8}$", RegexOptions.Compiled);
    private static readonly Regex EmailPattern = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private readonly IRepository<Client, long> _clientRepository;
    private readonly IRepository<TaskRegistration, long> _taskRegistrationRepository;

    public ClientAppService(
        IRepository<Client, long> clientRepository,
        IRepository<TaskRegistration, long> taskRegistrationRepository)
    {
        _clientRepository = clientRepository;
        _taskRegistrationRepository = taskRegistrationRepository;
    }

    [Authorize(ThabatPermissions.Clients.Default)]
    public async Task<PagedResultDto<ClientDto>> GetPagedAsync(GetClientsInput input)
    {
        var query = await _clientRepository.GetQueryableAsync();
        query = ApplyFilters(query, input.ColumnFilters);

        var filteredCount = await AsyncExecuter.CountAsync(query);
        query = ApplySorting(query, input.Sorting).PageBy(input);

        var clients = await AsyncExecuter.ToListAsync(query);
        return new PagedResultDto<ClientDto>(filteredCount, ObjectMapper.Map<List<Client>, List<ClientDto>>(clients));
    }

    [Authorize(ThabatPermissions.Clients.Default)]
    public async Task<ClientDto> GetAsync(long id)
    {
        var client = await _clientRepository.GetAsync(id);
        return ObjectMapper.Map<Client, ClientDto>(client);
    }

    [Authorize(ThabatPermissions.Clients.Create)]
    public async Task<ClientDto> CreateAsync(CreateUpdateClientDto input)
    {
        var client = new Client();
        await ApplyInputAsync(client, input);
        await _clientRepository.InsertAsync(client, autoSave: true);
        return ObjectMapper.Map<Client, ClientDto>(client);
    }

    [Authorize(ThabatPermissions.Clients.Edit)]
    public async Task<ClientDto> UpdateAsync(long id, CreateUpdateClientDto input)
    {
        var client = await _clientRepository.GetAsync(id);
        await ApplyInputAsync(client, input, id);
        await _clientRepository.UpdateAsync(client, autoSave: true);
        return ObjectMapper.Map<Client, ClientDto>(client);
    }

    [Authorize(ThabatPermissions.Clients.Delete)]
    public async Task DeleteAsync(long id)
    {
        if (await _taskRegistrationRepository.AnyAsync(x => x.ClientId == id))
        {
            throw new UserFriendlyException(L["Clients:DeleteBlocked"]);
        }

        await _clientRepository.DeleteAsync(id);
    }

    private async Task ApplyInputAsync(Client client, CreateUpdateClientDto input, long? currentId = null)
    {
        var name = input.Name?.Trim() ?? string.Empty;
        var email = input.EmailAddress?.Trim() ?? string.Empty;
        var phone = input.PhoneNumber?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new UserFriendlyException(L["Clients:Validation.NameRequired"]);
        }

        if (!EmailPattern.IsMatch(email))
        {
            throw new UserFriendlyException(L["Clients:Validation.InvalidEmail"]);
        }

        if (!PhonePattern.IsMatch(phone))
        {
            throw new UserFriendlyException(L["Clients:Validation.InvalidPhone"]);
        }

        var emailExists = await _clientRepository.AnyAsync(x =>
            x.EmailAddress == email && (!currentId.HasValue || x.Id != currentId.Value));
        if (emailExists)
        {
            throw new UserFriendlyException(L["Clients:Validation.DuplicateEmail"]);
        }

        var phoneExists = await _clientRepository.AnyAsync(x =>
            x.PhoneNumber == phone && (!currentId.HasValue || x.Id != currentId.Value));
        if (phoneExists)
        {
            throw new UserFriendlyException(L["Clients:Validation.DuplicatePhone"]);
        }

        client.Name = name;
        client.EmailAddress = email;
        client.PhoneNumber = phone;
        client.IsActive = input.IsActive;
    }

    private static IQueryable<Client> ApplyFilters(IQueryable<Client> query, List<ClientColumnFilterDto>? filters)
    {
        if (filters == null)
        {
            return query;
        }

        foreach (var filter in filters)
        {
            var value = filter.Value?.Trim();
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            switch (filter.ColumnName?.ToLowerInvariant())
            {
                case "name":
                    query = query.Where(x => x.Name != null && x.Name.Contains(value));
                    break;
                case "emailaddress":
                    query = query.Where(x => x.EmailAddress != null && x.EmailAddress.Contains(value));
                    break;
                case "phonenumber":
                    query = query.Where(x => x.PhoneNumber != null && x.PhoneNumber.Contains(value));
                    break;
                case "isactive":
                    if (bool.TryParse(value, out var isActive))
                    {
                        query = query.Where(x => x.IsActive == isActive);
                    }
                    break;
            }
        }

        return query;
    }

    private static IQueryable<Client> ApplySorting(IQueryable<Client> query, string? sorting)
    {
        var value = string.IsNullOrWhiteSpace(sorting) ? "CreationTime desc" : sorting.Trim();
        value = value.Replace("entity.", "", StringComparison.OrdinalIgnoreCase);
        var parts = value.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var field = parts[0];
        var descending = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);

        return field.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "emailaddress" => descending ? query.OrderByDescending(x => x.EmailAddress) : query.OrderBy(x => x.EmailAddress),
            "phonenumber" => descending ? query.OrderByDescending(x => x.PhoneNumber) : query.OrderBy(x => x.PhoneNumber),
            "isactive" => descending ? query.OrderByDescending(x => x.IsActive) : query.OrderBy(x => x.IsActive),
            "id" => descending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id),
            _ => descending ? query.OrderByDescending(x => x.CreationTime) : query.OrderBy(x => x.CreationTime)
        };
    }
}
