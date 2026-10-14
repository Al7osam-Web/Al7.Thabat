using System.Threading.Tasks;
using Al7.Thabat.Media;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Content;

namespace Al7.Thabat.Controllers.Media;

[RemoteService(Name = "Default")]
[Area("app")]
[Route("api/app/media")]
public class MediaController : ThabatController
{
    private readonly IMediaAppService _mediaAppService;

    public MediaController(IMediaAppService mediaAppService)
    {
        _mediaAppService = mediaAppService;
    }

    [Authorize]
    [IgnoreAntiforgeryToken]
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public Task<MediaUploadResultDto> UploadAsync(
        IRemoteStreamContent file,
        [FromForm] string? containerName = null,
        [FromForm] int? width = null,
        [FromForm] int? height = null)
    {
        if (file == null || file.ContentLength.GetValueOrDefault() <= 0)
        {
            throw new UserFriendlyException(L["Media:FileRequired"]);
        }

        if (string.IsNullOrWhiteSpace(containerName))
        {
            throw new UserFriendlyException(L["Media:ContainerRequired"]);
        }

        return _mediaAppService.UploadAsync(new MediaUploadInputDto
        {
            File = file,
            ContainerName = containerName.Trim(),
            Width = width,
            Height = height
        });
    }

    [HttpGet]
    public Task<IRemoteStreamContent?> GetAsync([FromQuery] string containerName, [FromQuery] string blobName)
    {
        return _mediaAppService.GetAsync(containerName, blobName);
    }

    [Authorize]
    [HttpDelete]
    public Task DeleteAsync([FromQuery] string containerName, [FromQuery] string blobName)
    {
        return _mediaAppService.DeleteAsync(containerName, blobName);
    }
}
