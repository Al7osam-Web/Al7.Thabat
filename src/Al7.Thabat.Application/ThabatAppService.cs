using Al7.Thabat.Localization;
using Volo.Abp.Application.Services;

namespace Al7.Thabat;

/* Inherit your application services from this class.
 */
public abstract class ThabatAppService : ApplicationService
{
    protected ThabatAppService()
    {
        LocalizationResource = typeof(ThabatResource);
    }
}
