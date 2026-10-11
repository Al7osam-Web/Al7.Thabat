using Al7.Thabat.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace Al7.Thabat.Permissions;

public class ThabatPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(ThabatPermissions.GroupName);

        var crudExamples = myGroup.AddPermission(
            ThabatPermissions.CrudExamples.Default,
            L("Permission:CrudExamples"));
        crudExamples.AddChild(
            ThabatPermissions.CrudExamples.Create,
            L("Permission:CrudExamples.Create"));
        crudExamples.AddChild(
            ThabatPermissions.CrudExamples.Edit,
            L("Permission:CrudExamples.Edit"));
        crudExamples.AddChild(
            ThabatPermissions.CrudExamples.Delete,
            L("Permission:CrudExamples.Delete"));

        myGroup.AddPermission(
            ThabatPermissions.SitePages.Default,
            L("Permission:SitePages"));

        var clients = myGroup.AddPermission(
            ThabatPermissions.Clients.Default,
            L("Permission:Clients"));
        clients.AddChild(ThabatPermissions.Clients.Create, L("Permission:Clients.Create"));
        clients.AddChild(ThabatPermissions.Clients.Edit, L("Permission:Clients.Edit"));
        clients.AddChild(ThabatPermissions.Clients.Delete, L("Permission:Clients.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<ThabatResource>(name);
    }
}
