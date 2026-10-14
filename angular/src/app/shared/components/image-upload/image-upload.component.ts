import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent implements OnChanges, OnDestroy {
  @Input() imageUrl?: string | null;
  @Input() controlName = 'file';
  @Input() accept = 'image/*';
  @Input() chooseLabel?: string;
  @Input() changeLabel?: string;
  @Output() imageSelected = new EventEmitter<{ file: File; controlName?: string }>();
  @Output() imageRemoved = new EventEmitter<{ controlName?: string }>();

  previewUrl: string | ArrayBuffer | null = null;
  previewKind: 'image' | 'video' | 'pdf' | 'file' | null = null;
  selectedFileName = '';
  hasImage = false;
  isNewImage = false;
  private storedBackendUrl?: string | null;
  private localObjectUrl: string | null = null;

  ngOnChanges(): void {
    // Keep the local object URL after picking a file; parent form patches
    // often change imageUrl to a temporary filename and would break preview.
    if (this.isNewImage) {
      return;
    }

    if (this.imageUrl) {
      this.revokeLocalObjectUrl();
      this.storedBackendUrl = this.imageUrl;
      this.previewUrl = this.imageUrl;
      this.previewKind = this.kindFromUrl(this.imageUrl);
      this.selectedFileName = '';
      this.hasImage = true;
      this.isNewImage = false;
    } else {
      this.storedBackendUrl = null;
      this.previewUrl = null;
      this.previewKind = null;
      this.selectedFileName = '';
      this.hasImage = false;
      this.isNewImage = false;
    }
  }

  ngOnDestroy(): void {
    this.revokeLocalObjectUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.applyLocalFile(input.files[0]);
      this.imageSelected.emit({ file: input.files[0], controlName: this.controlName });
    }
  }

  removeImage(): void {
    this.revokeLocalObjectUrl();
    this.selectedFileName = '';
    if (this.storedBackendUrl) {
      this.previewUrl = this.storedBackendUrl;
      this.previewKind = this.kindFromUrl(this.storedBackendUrl);
      this.isNewImage = false;
      this.hasImage = true;
    } else {
      this.previewUrl = null;
      this.previewKind = null;
      this.hasImage = false;
    }

    this.imageRemoved.emit({ controlName: this.controlName });
    const fileInput = document.getElementById(`fileInput_${this.controlName}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById(`fileInput_${this.controlName}`) as HTMLInputElement;
    fileInput?.click();
  }

  get showVideoElement(): boolean {
    return this.previewKind === 'video' && !!this.previewUrl && !this.isLocalHeavyPreview;
  }

  get showVideoPlaceholder(): boolean {
    return this.previewKind === 'video' && !this.showVideoElement;
  }

  get showImagePreview(): boolean {
    return this.previewKind === 'image' && !!this.previewUrl;
  }

  get showPdfPreview(): boolean {
    return this.previewKind === 'pdf';
  }

  get showFilePlaceholder(): boolean {
    return this.previewKind === 'file';
  }

  private get isLocalHeavyPreview(): boolean {
    const url = (this.previewUrl || '').toString();
    return url.startsWith('blob:') || url.startsWith('data:');
  }

  private applyLocalFile(file: File): void {
    this.revokeLocalObjectUrl();
    this.selectedFileName = file.name;
    this.hasImage = true;
    this.isNewImage = true;
    this.previewKind = this.kindFromFile(file);

    if (this.previewKind === 'image') {
      this.localObjectUrl = URL.createObjectURL(file);
      this.previewUrl = this.localObjectUrl;
      return;
    }

    this.previewUrl = this.previewKind === 'pdf' ? 'local.pdf' : null;
  }

  private kindFromFile(file: File): 'image' | 'video' | 'pdf' | 'file' {
    const type = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    if (type.startsWith('video/') || /\.(mp4|mov|webm|ogg)$/i.test(name)) {
      return 'video';
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (type.startsWith('image/')) {
      return 'image';
    }
    return 'file';
  }

  private kindFromUrl(url: string): 'image' | 'video' | 'pdf' | 'file' {
    const normalized = url.toLowerCase();
    if (
      normalized.includes('.mp4') ||
      normalized.includes('.mov') ||
      normalized.includes('.webm') ||
      normalized.startsWith('data:video')
    ) {
      return 'video';
    }
    if (normalized.includes('.pdf') || normalized.includes('application/pdf')) {
      return 'pdf';
    }
    return 'image';
  }

  private revokeLocalObjectUrl(): void {
    if (this.localObjectUrl) {
      URL.revokeObjectURL(this.localObjectUrl);
      this.localObjectUrl = null;
    }
  }
}
