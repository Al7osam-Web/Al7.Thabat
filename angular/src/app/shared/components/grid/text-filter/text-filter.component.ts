import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { LocalizationService } from '@abp/ng.core';
import { FilterMetadata, SelectItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  standalone: false,

  selector: 'ngx-text-filter',
  templateUrl: './text-filter.component.html',
})
export class TextFilterComponent implements OnInit {
  @Input() text: any;
  @Input() field: string;
  @Input() column: string;
  @Output() filterMetadata: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('overlayPanel') overlayPanel: OverlayPanel;

  options: SelectItem[] = [];
  selectedValue = '';
  constructor(private localizationService: LocalizationService) {}

  ngOnInit(): void {
  }

  reset(): void {
    this.selectedValue = '';
  }

  onValueChange(event: any): void {
   
    let filterMetadata: { [key: string]: FilterMetadata[] } = {};
    filterMetadata[this.field] = [
      {
        value: +event.value,
        operator: 'and',
        matchMode: 'equals',
      },
    ];

    this.filterMetadata.emit({ filters: filterMetadata });

    this.overlayPanel.hide();
  }

  showOverlay(event: MouseEvent) {
    this.overlayPanel.show(event);
  }


}
