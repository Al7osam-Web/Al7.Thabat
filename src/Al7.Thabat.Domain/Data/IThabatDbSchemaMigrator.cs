using System.Threading.Tasks;

namespace Al7.Thabat.Data;

public interface IThabatDbSchemaMigrator
{
    Task MigrateAsync();
}
