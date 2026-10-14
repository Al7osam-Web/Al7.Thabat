using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Al7.Thabat.Common;
using Al7.Thabat.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;

namespace Al7.Thabat.Repositories;

public class CommonRepository : ICommonRepository, ITransientDependency
{
    private readonly IDbContextProvider<ThabatDbContext> _dbContextProvider;

    public CommonRepository(IDbContextProvider<ThabatDbContext> dbContextProvider)
    {
        _dbContextProvider = dbContextProvider;
    }

    public async Task<T?> GetStoredProcedureAsync<T>(string storedProcedureName, Dictionary<string, object> parameters)
        where T : class
    {
        var rows = await ExecuteStoredProcedureAndMapAsync<T>(storedProcedureName, parameters);
        return rows.SingleOrDefault();
    }

    public async Task<List<T>> GetListStoredProcedureAsync<T>(
        string storedProcedureName,
        Dictionary<string, object> parameters)
        where T : class
    {
        return await ExecuteStoredProcedureAndMapAsync<T>(storedProcedureName, parameters);
    }

    private async Task<List<T>> ExecuteStoredProcedureAndMapAsync<T>(
        string storedProcedureName,
        Dictionary<string, object> parameters)
        where T : class
    {
        var dbContext = await _dbContextProvider.GetDbContextAsync();
        var connection = dbContext.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
        {
            await connection.OpenAsync();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = storedProcedureName;
            command.CommandType = CommandType.StoredProcedure;
            command.CommandTimeout = 120;
            command.Transaction = dbContext.Database.CurrentTransaction?.GetDbTransaction();

            foreach (var parameter in parameters ?? new Dictionary<string, object>())
            {
                command.Parameters.Add(new SqlParameter($"@{parameter.Key}", parameter.Value ?? DBNull.Value));
            }

            using var reader = await command.ExecuteReaderAsync();
            while (reader.FieldCount == 0 && await reader.NextResultAsync())
            {
            }

            var result = new List<T>();
            if (reader.FieldCount == 0)
            {
                return result;
            }

            while (await reader.ReadAsync())
            {
                result.Add(MapRecordToObject<T>(reader));
            }

            return result;
        }
        finally
        {
            if (shouldClose && connection.State == ConnectionState.Open)
            {
                await connection.CloseAsync();
            }
        }
    }

    private static T MapRecordToObject<T>(IDataRecord record)
        where T : class
    {
        var obj = Activator.CreateInstance<T>();
        var properties = typeof(T)
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanWrite)
            .ToDictionary(p => p.Name, p => p, StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < record.FieldCount; i++)
        {
            if (record.IsDBNull(i))
            {
                continue;
            }

            if (!properties.TryGetValue(record.GetName(i), out var property))
            {
                continue;
            }

            var value = record.GetValue(i);
            var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
            if (targetType.IsEnum)
            {
                property.SetValue(obj, Enum.ToObject(targetType, value));
                continue;
            }

            if (targetType == typeof(decimal))
            {
                property.SetValue(obj, Convert.ToDecimal(value, CultureInfo.InvariantCulture));
                continue;
            }

            if (targetType == typeof(int))
            {
                property.SetValue(obj, Convert.ToInt32(value, CultureInfo.InvariantCulture));
                continue;
            }

            if (targetType == typeof(long))
            {
                property.SetValue(obj, Convert.ToInt64(value, CultureInfo.InvariantCulture));
                continue;
            }

            if (targetType == typeof(bool))
            {
                property.SetValue(obj, Convert.ToBoolean(value, CultureInfo.InvariantCulture));
                continue;
            }

            if (targetType == typeof(DateTime))
            {
                property.SetValue(obj, Convert.ToDateTime(value, CultureInfo.InvariantCulture));
                continue;
            }

            property.SetValue(obj, Convert.ChangeType(value, targetType, CultureInfo.InvariantCulture));
        }

        return obj;
    }
}
