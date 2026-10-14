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

        var books = myGroup.AddPermission(
            ThabatPermissions.Books.Default,
            L("Permission:Books"));
        books.AddChild(ThabatPermissions.Books.Create, L("Permission:Books.Create"));
        books.AddChild(ThabatPermissions.Books.Edit, L("Permission:Books.Edit"));
        books.AddChild(ThabatPermissions.Books.Delete, L("Permission:Books.Delete"));

        var tasks = myGroup.AddPermission(
            ThabatPermissions.Tasks.Default,
            L("Permission:Tasks"));
        tasks.AddChild(ThabatPermissions.Tasks.Create, L("Permission:Tasks.Create"));
        tasks.AddChild(ThabatPermissions.Tasks.Edit, L("Permission:Tasks.Edit"));
        tasks.AddChild(ThabatPermissions.Tasks.Delete, L("Permission:Tasks.Delete"));

        var surveyQuestions = myGroup.AddPermission(
            ThabatPermissions.SurveyQuestions.Default,
            L("Permission:SurveyQuestions"));
        surveyQuestions.AddChild(ThabatPermissions.SurveyQuestions.Create, L("Permission:SurveyQuestions.Create"));
        surveyQuestions.AddChild(ThabatPermissions.SurveyQuestions.Edit, L("Permission:SurveyQuestions.Edit"));
        surveyQuestions.AddChild(ThabatPermissions.SurveyQuestions.Delete, L("Permission:SurveyQuestions.Delete"));

        var subscriptionPackages = myGroup.AddPermission(
            ThabatPermissions.SubscriptionPackages.Default,
            L("Permission:SubscriptionPackages"));
        subscriptionPackages.AddChild(ThabatPermissions.SubscriptionPackages.Create, L("Permission:SubscriptionPackages.Create"));
        subscriptionPackages.AddChild(ThabatPermissions.SubscriptionPackages.Edit, L("Permission:SubscriptionPackages.Edit"));
        subscriptionPackages.AddChild(ThabatPermissions.SubscriptionPackages.Delete, L("Permission:SubscriptionPackages.Delete"));

        var faqs = myGroup.AddPermission(
            ThabatPermissions.Faqs.Default,
            L("Permission:Faqs"));
        faqs.AddChild(ThabatPermissions.Faqs.Create, L("Permission:Faqs.Create"));
        faqs.AddChild(ThabatPermissions.Faqs.Edit, L("Permission:Faqs.Edit"));
        faqs.AddChild(ThabatPermissions.Faqs.Delete, L("Permission:Faqs.Delete"));

        var paths = myGroup.AddPermission(
            ThabatPermissions.Paths.Default,
            L("Permission:Paths"));
        paths.AddChild(ThabatPermissions.Paths.Create, L("Permission:Paths.Create"));
        paths.AddChild(ThabatPermissions.Paths.Edit, L("Permission:Paths.Edit"));
        paths.AddChild(ThabatPermissions.Paths.Delete, L("Permission:Paths.Delete"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<ThabatResource>(name);
    }
}
