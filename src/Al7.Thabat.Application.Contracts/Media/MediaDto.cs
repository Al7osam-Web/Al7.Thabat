using System.ComponentModel.DataAnnotations;
using Volo.Abp.Content;

namespace Al7.Thabat.Media;

public class MediaUploadInputDto
{
    [Required]
    public IRemoteStreamContent File { get; set; } = null!;

    [Required]
    public string ContainerName { get; set; } = string.Empty;

    public int? Width { get; set; }
    public int? Height { get; set; }
}

public class MediaUploadResultDto
{
    public string BlobName { get; set; } = string.Empty;
    public string ContainerName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
}

public static class MediaContainerNames
{
    public const string BookCovers = "book-covers";
    public const string BookFiles = "book-files";
}
