import { Component, EventEmitter, Injector, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '../../app-component-base';



@Component({
  standalone: false, 
  selector: 'msn-input-image',
  templateUrl: './input-image.component.html',
  styleUrls: ['./input-image.component.css']
})
export class InputImageComponent extends AppComponentBase {
  @Output() inputFileChanged: EventEmitter<any> = new EventEmitter();
  @Output() file: EventEmitter<any> = new EventEmitter();
  @Input() url: any = '';
  @Input() name: string = '';
  @Input() viewImage: boolean = true;
  @Input() disabled: boolean = false;
  @Input() accept: string = 'image/*';
  @Input() resetTrigger: boolean;
  @Input() fielType: string = 'image';
  @Output() onremoveImage: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Input() selectedFile: any = null; // Store a single file, renamed from `file` to `selectedFile`

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] && changes['resetTrigger'].currentValue === true) {
      this.clearFileInput();
    }
  }

  clearFileInput(): void {
    this.url = '';
    this.selectedFile = null;
    this.inputFileChanged.emit(this.selectedFile);
    this.onremoveImage.emit(true);
    const inputElement = document.getElementById(`file-upload${this.name}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = ''; // Clear the file input
    }
  }

  onUploadImage(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]; // Only take the first file (single file)
      const reader = new FileReader();
      const fileData = {
        fileName: selectedFile.name,
        path: '', // Will be set after reading the file
        extension: selectedFile.type.split('/')[1],
        type: selectedFile.type,
      };

      reader.readAsDataURL(selectedFile); // Read the file as a Data URL
      reader.onload = () => {
        fileData.path = reader.result as string;

        this.selectedFile = fileData; // Store the selected file data
        this.inputFileChanged.emit(this.selectedFile); // Emit the file data
       
      };
      this.file.emit(selectedFile);
      if (this.selectedFile && this.selectedFile.path) 
      this.url = this.selectedFile.path;  // Emit the selected file
    }
  }

  // removeImage(): void {
  //   this.url = '';
  //   this.inputFileChanged.emit(this.url);
  //   this.onremoveImage.emit(true);
  // }

  removeImage(): void {
    
    this.url = '';
    this.selectedFile = null; // Remove the file data
    this.inputFileChanged.emit(this.selectedFile);
    this.onremoveImage.emit(true);
  }

  translate(key: string, ...args: any[]): string {
    return this.l(key, args);
  }
}
