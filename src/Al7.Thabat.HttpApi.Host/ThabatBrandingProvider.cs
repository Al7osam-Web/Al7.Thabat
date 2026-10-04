using Microsoft.Extensions.Localization;
using Al7.Thabat.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace Al7.Thabat;

[Dependency(ReplaceServices = true)]
public class ThabatBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<ThabatResource> _localizer;

    public ThabatBrandingProvider(IStringLocalizer<ThabatResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
