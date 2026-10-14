using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace Al7.Thabat.Subscriptions;

public class SubscriptionPackageDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<SubscriptionPackage, long> _packageRepository;

    public SubscriptionPackageDataSeedContributor(IRepository<SubscriptionPackage, long> packageRepository)
    {
        _packageRepository = packageRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _packageRepository.GetCountAsync() > 0)
        {
            return;
        }

        const string descriptionAr = "يمكنك إلغاء الاشتراك اذا لم يكن مفيد لك";
        const string descriptionEn = "You can cancel the subscription if it is not useful for you";

        await _packageRepository.InsertAsync(new SubscriptionPackage
        {
            NameAr = "الاشتراك السنوي",
            NameEn = "Yearly subscription",
            DescriptionAr = descriptionAr,
            DescriptionEn = descriptionEn,
            Period = SubscriptionPeriod.Yearly,
            Price = 10.99m,
            BilledPrice = 131.88m,
            OriginalPrice = 179.99m,
            Sort = 1,
            IsFeatured = true
        }, autoSave: true);

        await _packageRepository.InsertAsync(new SubscriptionPackage
        {
            NameAr = "الاشتراك 3 أشهر",
            NameEn = "3-month subscription",
            DescriptionAr = descriptionAr,
            DescriptionEn = descriptionEn,
            Period = SubscriptionPeriod.ThreeMonths,
            Price = 12.99m,
            BilledPrice = 38.97m,
            OriginalPrice = 56.97m,
            Sort = 2
        }, autoSave: true);

        await _packageRepository.InsertAsync(new SubscriptionPackage
        {
            NameAr = "الاشتراك الشهري",
            NameEn = "Monthly subscription",
            DescriptionAr = descriptionAr,
            DescriptionEn = descriptionEn,
            Period = SubscriptionPeriod.Monthly,
            Price = 18.99m,
            BilledPrice = 18.99m,
            OriginalPrice = 29.99m,
            Sort = 3
        }, autoSave: true);
    }
}
