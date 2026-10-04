import { LocalizationService } from '@abp/ng.core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, tap } from 'rxjs';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { ISearchableDropdown } from 'src/app/sharedFeatures/models/searchable-dropdown.model';

@Component({
  standalone: false,

  selector: 'app-searable-dropdown',
  templateUrl: './searable-dropdown.component.html',
})
export class SearableDropdownComponent implements OnInit {
  @Input() options: any[] = [];

  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() selectedItem: any = {
    id: 0,
    //TableUpdated
    /*  name:
      this.localizationService.instant('shared.chosePlease') + this.label ?? '', */
    name: '',
  };
  @Output() dropdownChanged: EventEmitter<any> = new EventEmitter<any>();

  @Output() searchModelChanged: EventEmitter<ISearchableDropdown> =
    new EventEmitter<ISearchableDropdown>();
  searchCtrl = new FormControl();
  searchModel: ISearchableDropdown = new ISearchableDropdown();
  constructor(private localizationService: LocalizationService) {}
  ngOnInit(): void {
    this.searchModel.pagination = Pagination.newPagination(0, Pagination.DefaultPageSize, 0, false);
    this.scrollListener();
    this.onSearchInputChange();
  }

  toggle() {
    if (this.disabled) return;
    document.getElementById('edmsDropdown')?.classList.toggle('show');
  }
  onItemClick(item: any) {
    this.selectedItem = item;
    this.dropdownChanged.emit(this.selectedItem);
    this.toggle();
  }
  onSearchInputChange(): void {
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(500),
        filter(searchText => typeof searchText === 'string'),
        tap(searchText => {
          this.searchModel.name = searchText;
          this.searchModel.pagination.pageIndex = 0;
          this.searchModelChanged.emit(this.searchModel);
        })
      )
      .subscribe(res => {
        //   this.options = res;
        //this.storeItemListRetriving = false;
      });
  }
  scrollListener() {
    const optionsList = document.getElementById('OptionsList');
    let lastScrollTop = 0;
    if (optionsList)
      optionsList.onscroll = e => {
        if (
          optionsList.scrollTop === optionsList.scrollHeight - 200 &&
          (this.searchModel?.pagination?.pageIndex || this.searchModel?.pagination?.pageIndex === 0)
        ) {
          this.searchModel.pagination.pageSize =
            this.searchModel.pagination.pageSize ?? 0 + Pagination.DefaultPageSize;
          this.searchModelChanged.emit(this.searchModel);
        }
      };
  }
}
