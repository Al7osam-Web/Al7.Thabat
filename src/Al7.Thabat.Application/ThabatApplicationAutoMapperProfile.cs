using Al7.Thabat.Books;
using Al7.Thabat.Clients;
using Al7.Thabat.CrudExamples;
using Al7.Thabat.Faqs;
using Al7.Thabat.Paths;
using Al7.Thabat.SitePages;
using Al7.Thabat.Subscriptions;
using Al7.Thabat.Surveys;
using Al7.Thabat.Tasks;
using AutoMapper;

namespace Al7.Thabat;

public class ThabatApplicationAutoMapperProfile : Profile
{
    public ThabatApplicationAutoMapperProfile()
    {
        CreateMap<CrudExample, CrudExampleDto>();
        CreateMap<SitePage, SitePageDto>();
        CreateMap<Client, ClientDto>();
        CreateMap<Book, BookDto>()
            .ForMember(dest => dest.Media, opt => opt.Ignore());
        CreateMap<BookMedia, BookMediaDto>();
        CreateMap<TaskItem, TaskDto>();
        CreateMap<SurveyQuestion, SurveyQuestionDto>()
            .ForMember(dest => dest.Answers, opt => opt.Ignore())
            .ForMember(dest => dest.AnswersCount, opt => opt.Ignore());
        CreateMap<SurveyAnswer, SurveyAnswerDto>();
        CreateMap<SubscriptionPackage, SubscriptionPackageDto>();
        CreateMap<Faq, FaqDto>();
        CreateMap<PathDay, PathDto>()
            .ForMember(dest => dest.Feelings, opt => opt.Ignore())
            .ForMember(dest => dest.Challenges, opt => opt.Ignore())
            .ForMember(dest => dest.Tips, opt => opt.Ignore())
            .ForMember(dest => dest.FeelingsCount, opt => opt.Ignore())
            .ForMember(dest => dest.ChallengesCount, opt => opt.Ignore())
            .ForMember(dest => dest.TipsCount, opt => opt.Ignore());
        CreateMap<PathEntry, PathEntryDto>();
    }
}
