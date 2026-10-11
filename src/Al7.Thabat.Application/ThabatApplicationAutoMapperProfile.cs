using Al7.Thabat.Clients;
using Al7.Thabat.CrudExamples;
using Al7.Thabat.SitePages;
using AutoMapper;

namespace Al7.Thabat;

public class ThabatApplicationAutoMapperProfile : Profile
{
    public ThabatApplicationAutoMapperProfile()
    {
        CreateMap<CrudExample, CrudExampleDto>();
        CreateMap<SitePage, SitePageDto>();
        CreateMap<Client, ClientDto>();
    }
}
