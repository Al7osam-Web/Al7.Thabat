import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: false,

  selector: 'delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.sass'],
})
export class DeleteModalComponent implements OnInit {
  deleteMessage: string = '';
  deleteAction!: () => void;

  constructor(
    public dynamicDialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.deleteMessage = this.config.data.bodyMessage;

    this.deleteAction = this.config.data.deleteAction;
  }

  close(): void {
    this.dynamicDialogRef.close();
  }
}
