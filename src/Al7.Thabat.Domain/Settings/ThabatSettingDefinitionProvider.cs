using Volo.Abp.Settings;

namespace Al7.Thabat.Settings;

public class ThabatSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(ThabatSettings.MySetting1));
    }
}
