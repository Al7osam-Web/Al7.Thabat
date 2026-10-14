using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;

namespace Al7.Thabat.Media;

public interface IMediaAppService : IApplicationService
{
    Task<MediaUploadResultDto> UploadAsync(MediaUploadInputDto input);
    Task<IRemoteStreamContent?> GetAsync(string containerName, string blobName);
    Task DeleteAsync(string containerName, string blobName);
}
