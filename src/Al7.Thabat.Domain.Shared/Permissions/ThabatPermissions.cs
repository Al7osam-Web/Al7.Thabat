namespace Al7.Thabat.Permissions;

public static class ThabatPermissions
{
    public const string GroupName = "Thabat";

    public static class CrudExamples
    {
        public const string Default = GroupName + ".CrudExamples";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }

    public static class SitePages
    {
        public const string Default = GroupName + ".SitePages";
    }

    public static class Clients
    {
        public const string Default = GroupName + ".Clients";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
    }
}
