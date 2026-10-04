using Al7.Thabat.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace Al7.Thabat.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class ThabatController : AbpControllerBase
{
    protected ThabatController()
    {
        LocalizationResource = typeof(ThabatResource);
    }
}
