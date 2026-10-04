using System;
using System.Linq;
using System.Threading.Tasks;
using Al7.Thabat.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.CrudExamples;

public class CrudExampleAppService : CrudAppService<
    CrudExample,
    CrudExampleDto,
    Guid,
    GetCrudExampleListInput,
    CreateUpdateCrudExampleDto>, ICrudExampleAppService
{
    public CrudExampleAppService(IRepository<CrudExample, Guid> repository)
        : base(repository)
    {
        GetPolicyName = ThabatPermissions.CrudExamples.Default;
        GetListPolicyName = ThabatPermissions.CrudExamples.Default;
        CreatePolicyName = ThabatPermissions.CrudExamples.Create;
        UpdatePolicyName = ThabatPermissions.CrudExamples.Edit;
        DeletePolicyName = ThabatPermissions.CrudExamples.Delete;
    }

    public override async Task<CrudExampleDto> CreateAsync(CreateUpdateCrudExampleDto input)
    {
        await CheckCreatePolicyAsync();

        var entity = new CrudExample(
            GuidGenerator.Create(),
            input.Name,
            input.Description,
            input.IsActive);

        await Repository.InsertAsync(entity, autoSave: true);
        return ObjectMapper.Map<CrudExample, CrudExampleDto>(entity);
    }

    public override async Task<CrudExampleDto> UpdateAsync(Guid id, CreateUpdateCrudExampleDto input)
    {
        await CheckUpdatePolicyAsync();

        var entity = await Repository.GetAsync(id);
        entity.SetName(input.Name);
        entity.SetDescription(input.Description);

        if (input.IsActive)
        {
            entity.Activate();
        }
        else
        {
            entity.Deactivate();
        }

        await Repository.UpdateAsync(entity, autoSave: true);
        return ObjectMapper.Map<CrudExample, CrudExampleDto>(entity);
    }

    protected override async Task<IQueryable<CrudExample>> CreateFilteredQueryAsync(GetCrudExampleListInput input)
    {
        var query = await base.CreateFilteredQueryAsync(input);

        return query
            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), x => x.Name.Contains(input.Filter!))
            .WhereIf(input.IsActive.HasValue, x => x.IsActive == input.IsActive);
    }

    protected override IQueryable<CrudExample> ApplyDefaultSorting(IQueryable<CrudExample> query)
    {
        return query.OrderByDescending(x => x.CreationTime);
    }
}
