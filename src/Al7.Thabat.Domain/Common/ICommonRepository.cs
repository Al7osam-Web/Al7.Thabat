using System.Collections.Generic;
using System.Threading.Tasks;

namespace Al7.Thabat.Common;

public interface ICommonRepository
{
    Task<T?> GetStoredProcedureAsync<T>(string storedProcedureName, Dictionary<string, object> parameters)
        where T : class;

    Task<List<T>> GetListStoredProcedureAsync<T>(string storedProcedureName, Dictionary<string, object> parameters)
        where T : class;
}
