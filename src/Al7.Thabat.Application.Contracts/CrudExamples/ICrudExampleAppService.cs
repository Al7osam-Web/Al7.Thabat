using System;
using Volo.Abp.Application.Services;

namespace Al7.Thabat.CrudExamples;

public interface ICrudExampleAppService : ICrudAppService<
    CrudExampleDto,
    Guid,
    GetCrudExampleListInput,
    CreateUpdateCrudExampleDto>
{
}
