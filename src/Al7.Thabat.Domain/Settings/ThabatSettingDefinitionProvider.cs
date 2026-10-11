using Volo.Abp.Settings;

namespace Al7.Thabat.Settings;

public class ThabatSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        context.Add(new SettingDefinition(ThabatSettings.TermsAndConditionsAr, "", isVisibleToClients: true));
        context.Add(new SettingDefinition(ThabatSettings.TermsAndConditionsEn, "", isVisibleToClients: true));
        context.Add(new SettingDefinition(ThabatSettings.PrivacyPolicyAr, "", isVisibleToClients: true));
        context.Add(new SettingDefinition(ThabatSettings.PrivacyPolicyEn, "", isVisibleToClients: true));
    }
}
