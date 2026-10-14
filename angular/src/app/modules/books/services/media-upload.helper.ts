import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MediaService } from 'src/app/proxy/media';

export const BookMediaContainers = {
  covers: 'book-covers',
  files: 'book-files',
  coverWidth: 400,
  coverHeight: 600,
  maxCoverSizeMb: 2,
  maxFileSizeMb: 20,
} as const;

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }

  // Local selection often stores only the file name; that is not a real server path.
  if (!path.includes('/') && !path.includes('\\')) {
    return null;
  }

  const apiUrl = environment.apis?.default?.url?.replace(/\/$/, '') || '';
  return `${apiUrl}/${path.replace(/^\//, '')}`;
}

export function resolveMediaContainer(path?: string | null): { containerName: string; blobName: string } | null {
  if (!path) {
    return null;
  }

  const normalized = path.replace(/\\/g, '/').replace(/^\//, '');
  if (normalized.startsWith('books/covers/')) {
    return {
      containerName: BookMediaContainers.covers,
      blobName: normalized.substring('books/covers/'.length),
    };
  }

  if (normalized.startsWith('books/files/')) {
    return {
      containerName: BookMediaContainers.files,
      blobName: normalized.substring('books/files/'.length),
    };
  }

  return null;
}

export async function uploadMediaFile(
  mediaService: MediaService,
  file: File,
  containerName: string,
  width = 0,
  height = 0
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('containerName', containerName);
  formData.append('width', String(width));
  formData.append('height', String(height));

  const result = await firstValueFrom(mediaService.upload(formData));
  return result.filePath || result.blobName || '';
}

export async function deleteMediaFile(mediaService: MediaService, path?: string | null): Promise<void> {
  const target = resolveMediaContainer(path);
  if (!target?.blobName) {
    return;
  }

  await firstValueFrom(mediaService.delete(target.containerName, target.blobName));
}
