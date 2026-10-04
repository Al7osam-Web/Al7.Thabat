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

  selector: 'ngx-enum-filter',
  templateUrl: './enum-filter.component.html',
})
export class EnumFilterComponent implements OnInit {
  @Input() enum: any;
  @Input() field: string;
  @Input() column: string;
  @Input() isAdvancedFilter: boolean;

  @Output() filterMetadata: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('overlayPanel') overlayPanel: OverlayPanel;

  options: SelectItem[] = [];
  selectedValue = null;
  constructor(private localizationService: LocalizationService) {}

  ngOnInit(): void {
   
    this.getOptions();
  }

  reset(): void {
    this.selectedValue = '';
  }

  onValueChange(event: any): void {
    let filterMetadata: { [key: string]: FilterMetadata[] } = {};
    filterMetadata[this.field] = [
      {
        value:  event.value,
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

  getOptions(): void {
    this.options = Object.entries(this.enum).map(([key, value]) => ({
      label: this.localizationService.instant(`${key}`),
      value,
    }));
   
    // this.options.unshift({value:null,})
  }
}
