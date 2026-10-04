using Al7.Thabat.CrudExamples;
using AutoMapper;

namespace Al7.Thabat;

public class ThabatApplicationAutoMapperProfile : Profile
{
    public ThabatApplicationAutoMapperProfile()
    {
        CreateMap<CrudExample, CrudExampleDto>();
    }
}
