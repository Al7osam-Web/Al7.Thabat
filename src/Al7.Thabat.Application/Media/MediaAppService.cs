using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using Volo.Abp;
using Volo.Abp.Content;

namespace Al7.Thabat.Media;

[Authorize]
[RemoteService(false)]
public class MediaAppService : ThabatAppService, IMediaAppService
{
    public async Task<MediaUploadResultDto> UploadAsync(MediaUploadInputDto input)
    {
        ValidateContainer(input.ContainerName);

        var folderName = MapFolderName(input.ContainerName);
        var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var targetFolder = Path.Combine(webRootPath, folderName);
        Directory.CreateDirectory(targetFolder);

        var fileExtension = Path.GetExtension(input.File.FileName)?.ToLowerInvariant();
        var isImage = IsImageExtension(fileExtension);
        var fileName = isImage
            ? $"{Guid.NewGuid()}.webp"
            : $"{Guid.NewGuid()}{fileExtension}";
        var fullPath = Path.Combine(targetFolder, fileName);

        await using var stream = input.File.GetStream();
        if (isImage)
        {
            using var image = await Image.LoadAsync(stream);

            if (input.Width.GetValueOrDefault() > 0 || input.Height.GetValueOrDefault() > 0)
            {
                image.Mutate(x => x.Resize(BuildResizeOptions(input, image.Width, image.Height)));
            }

            await image.SaveAsync(fullPath, new WebpEncoder { Quality = 85 });
        }
        else
        {
            await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
            await stream.CopyToAsync(fileStream);
        }

        return new MediaUploadResultDto
        {
            BlobName = fileName,
            ContainerName = input.ContainerName,
            FilePath = $"{folderName}/{fileName}"
        };
    }

    public Task<IRemoteStreamContent?> GetAsync(string containerName, string blobName)
    {
        ValidateContainer(containerName);

        var folderName = MapFolderName(containerName);
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName, blobName);
        if (!File.Exists(fullPath))
        {
            return Task.FromResult<IRemoteStreamContent?>(null);
        }

        var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<IRemoteStreamContent?>(
            new RemoteStreamContent(fileStream, blobName, GetContentType(blobName)));
    }

    public Task DeleteAsync(string containerName, string blobName)
    {
        ValidateContainer(containerName);

        var folderName = MapFolderName(containerName);
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderName, blobName);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    private static void ValidateContainer(string containerName)
    {
        var validContainers = new[]
        {
            MediaContainerNames.BookCovers,
            MediaContainerNames.BookFiles,
        };

        if (!Array.Exists(validContainers, c => c == containerName))
        {
            throw new UserFriendlyException($"Invalid container name: {containerName}");
        }
    }

    private static string MapFolderName(string containerName)
    {
        return containerName switch
        {
            MediaContainerNames.BookCovers => "books/covers",
            MediaContainerNames.BookFiles => "books/files",
            _ => containerName
        };
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".mp4" => "video/mp4",
            ".mp3" => "audio/mpeg",
            _ => "application/octet-stream"
        };
    }

    private static bool IsImageExtension(string? extension)
    {
        return extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" or ".webp" or ".tif" or ".tiff";
    }

    private static ResizeOptions BuildResizeOptions(MediaUploadInputDto input, int sourceWidth, int sourceHeight)
    {
        var requestedWidth = input.Width.GetValueOrDefault();
        var requestedHeight = input.Height.GetValueOrDefault();

        if (requestedWidth > 0 && requestedHeight > 0)
        {
            return new ResizeOptions
            {
                Size = new Size(requestedWidth, requestedHeight),
                Mode = ResizeMode.Stretch
            };
        }

        if (requestedWidth > 0)
        {
            var height = (int)Math.Round(sourceHeight * (requestedWidth / (double)sourceWidth));
            return new ResizeOptions
            {
                Size = new Size(requestedWidth, Math.Max(1, height)),
                Mode = ResizeMode.Max
            };
        }

        var width = (int)Math.Round(sourceWidth * (requestedHeight / (double)sourceHeight));
        return new ResizeOptions
        {
            Size = new Size(Math.Max(1, width), Math.Max(1, requestedHeight)),
            Mode = ResizeMode.Max
        };
    }
}
