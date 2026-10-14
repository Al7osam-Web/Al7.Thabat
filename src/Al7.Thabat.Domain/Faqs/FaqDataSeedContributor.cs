using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Faqs;

public class FaqDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<Faq, long> _faqRepository;

    public FaqDataSeedContributor(IRepository<Faq, long> faqRepository)
    {
        _faqRepository = faqRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _faqRepository.GetCountAsync() > 0)
        {
            return;
        }

        await _faqRepository.InsertManyAsync(
            [
                new Faq
                {
                    TitleAr = "هل ثبات تطبيق مجاني؟",
                    DescriptionAr = "يمكنك استخدام الميزات الأساسية مجاناً. مع باقة ثبات بلس التي تفتح لك حظر التطبيقات المتقدم والمكتبة الكاملة.",
                    Sort = 1
                },
                new Faq
                {
                    TitleAr = "كيف يعمل حظر التطبيقات والمواقع؟",
                    DescriptionAr = "يمكنك اختيار التطبيقات والمواقع التي تريد حظرها، ويقوم ثبات بمنع الوصول إليها حسب إعداداتك.",
                    Sort = 2
                },
                new Faq
                {
                    TitleAr = "هل بياناتي وخصوصيتي آمنة؟",
                    DescriptionAr = "نعم، بياناتك محمية ولا يتم مشاركتها مع أي طرف ثالث.",
                    Sort = 3
                },
                new Faq
                {
                    TitleAr = "كيف ألغي اشتراكي في أي وقت؟",
                    DescriptionAr = "يمكنك إلغاء الاشتراك في أي وقت من إعدادات حسابك، ويستمر الاشتراك حتى نهاية المدة المدفوعة.",
                    Sort = 4
                },
                new Faq
                {
                    TitleAr = "ماذا يحدث لو سجلت انتكاسة؟",
                    DescriptionAr = "يمكنك تسجيل الانتكاسة ومتابعة رحلتك من جديد دون فقدان تقدمك السابق.",
                    Sort = 5
                }
            ],
            autoSave: true);
    }
}
