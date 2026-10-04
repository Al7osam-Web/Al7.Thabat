import { Injector,ViewChild, OnInit, Injectable,  NgModule } from '@angular/core';
import {LocalizationService} from '@abp/ng.core';
import { PrimengTableHelper } from '../shared/helpers/PrimengTableHelper';
import { PermissionService } from '@abp/ng.core';
import { ConfirmationService } from "primeng/api";
import { environment } from 'src/environments/environment';

import { FilterMetadata, SortMeta } from 'primeng/api';
import { BaseFilter, NewBaseFilter, BaseFilterMetaData } from 'src/app/sharedFeatures/models/base-filter.model';


@NgModule({
    providers: [ConfirmationService],
})
@Injectable()
export abstract class AppComponentBase implements OnInit {
  appBaseUrl = environment.apis.default.url;
  localizationSourceName = environment.localization.defaultResourceName;
 unreadCount = 0;
    localization: LocalizationService;
    primengTableHelper: PrimengTableHelper;
    currentLanguage: string = '';
    permissionService: PermissionService;
    confirmationService: ConfirmationService;
    constructor(injector: Injector,
    ) {
        this.localization = injector.get(LocalizationService);
        this.primengTableHelper = new PrimengTableHelper();
        this.permissionService = injector.get(PermissionService);
        this.confirmationService = injector.get(ConfirmationService);
    }

    ngOnInit(): void {
      // get user Type 
      
      this.currentLanguage = this.localization.currentLang;

    }
      l(key: string, ...args: any[]): string {
        // Construct the full key with the localization source name if needed
        const fullKey = `${this.localizationSourceName}::${key}`;
    
        // Retrieve localized text using the LocalizationService
        let localizedText = this.localization.instant({ key: fullKey, defaultValue: key } as any);
    
        // If no localized text is found, use the key as fallback
        if (!localizedText) {
          localizedText = key;
        }
    
        // If arguments are provided, format the string with the arguments
        if (args.length) {
          localizedText = args.reduce((result, value, index) => {
            return result.replace(`{${index}}`, value);
          }, localizedText);
        }
    
        return localizedText;
      }
    // l(key: string, ...args: any[]): string {
    //  
    //     let localizedText = this.localization.instant(key, ...args);

    //     if (!localizedText) {
    //         localizedText = key;
    //     }

    //     if (!args || !args.length) {
    //         return localizedText;
    //     }

    //     return localizedText
    // }


    isGranted(PermissionName: string){
        return this.permissionService.getGrantedPolicy(PermissionName);
    }

    confirm(action: string , description?: string , img?: string ): Promise<boolean> {
   
     
        return new Promise((resolve) => {
          this.confirmationService.confirm({
            message: `
              ${img ? `${img}` : `<div class="trash-alert"><img src="assets/images/bin.png" alt="Warning" width="70" height="70"></div>`}
              ${this.l(`Message:Confirm:${action}`)}
              ${description ? `<p>${this.l(description)}</p>` : " <p>عند اختيار حذف، لا يمكن الرجوع في ذلك الخيار.</p>"}
          `,
            header:null,
            acceptLabel: this.l("Confirm"),
            rejectLabel: this.l("إلغاء"),
            icon: null,
            acceptButtonStyleClass: "p-button-danger no-icon",
            rejectButtonStyleClass: "p-button-secondary no-icon",
            accept: () => {
              resolve(true);
            },
            reject: () => {
              resolve(false);
            },
          });
        });
      }

  fillter: BaseFilter = new BaseFilter();
  newFilter: NewBaseFilter = new NewBaseFilter();
  baseFilterMetaData : BaseFilterMetaData[] = [];
  filterHandeled(event: { [s: string]: FilterMetadata[] }): string {
    
      this.baseFilterMetaData = [];

    this.fillter.filterMetadata = event;
    this.newFilter.FilterNumber = 0;
    this.newFilter.Filters = [];
    var eventKeys = Object.keys(event);
    var eventValues = Object.values(event);
    
    if(eventValues.length == 0){
      this.baseFilterMetaData = [];
    }

    eventValues.forEach((currentListValue, index) => {
      if (Array.isArray(currentListValue)) {
        // If currentListValue is an array, iterate over it
        currentListValue.forEach((currentValue, index2) => {
          
          this.processFilterValue(currentValue, eventKeys[index] , (currentValue as any).relatedTableName);
        });
      } else if (typeof currentListValue === "object" && currentListValue !== null) {
        // If it's a single object, process it directly
        this.processFilterValue(currentListValue as FilterMetadata & { relatedTableName?: string }, eventKeys[index], (currentListValue as any).relatedTableName);
      }
    });


  return  JSON.stringify(this.baseFilterMetaData);//this.baseFilterMetaData;

  }
  
  private processFilterValue(currentValue: FilterMetadata, columnName: string , relatedTableName?: string) {
    if (currentValue.value != null && currentValue.value != undefined ) {
      let value = currentValue.value.toString();
      var matchMode = currentValue.matchMode
      if(currentValue.matchMode.includes(':')){

          matchMode = currentValue.matchMode.split(':')[1];
        var relatedTableName = relatedTableName; 
      } 
      
      const isDate = matchMode.includes("date");
      //if isdate == true genrate valu as date formate dd-mm-yyyy  else as string  
      if (isDate) {
        value = new Date(value).toLocaleDateString('en-CA');
      }


      let existingFilter = this.baseFilterMetaData.find(x => x.columnName == columnName);
      if (existingFilter) {
        existingFilter.value = value;
      } else {
    
        this.baseFilterMetaData.push({ columnName, value,relatedTableName, matchMode, isDate });
      }
    } else {
      let existingFilter = this.baseFilterMetaData.find(x => x.columnName == columnName);
      if (existingFilter) {
        existingFilter.value = null;
      }
    }
  }


  private mapSortField(field: string, tableName: string): string {
    const specialFields: Record<string, string> = {
      averageRate: 'AverageRate',
      ratingsCount: 'RatingsCount',
    };

    return specialFields[field] ?? `${tableName}.${field}`;
  }

  sortHandeled(requiredInfo: SortMeta[] , tableName): string {

    const info = requiredInfo[0];

    this.fillter.sorting = info.order === 1 ? info.field : `${info.field} desc`;
    //
    this.newFilter.Sorting.ColumnName = info.field;
    if (info.order === 1) this.newFilter.Sorting.Dir = `asc`;
    else this.newFilter.Sorting.Dir = `desc`;
    //
    const dir = this.newFilter.Sorting.Dir;
    if (info.field === 'averageRate') {
      return `AverageRate ${dir}, RatingsCount ${dir}`;
    }
   return `${this.mapSortField(this.newFilter.Sorting.ColumnName, tableName)} ${dir}`;
}
@ViewChild('currentPageRef') currentPageComponent: any;

  callNgOnInit() {
    
    if (this.currentPageComponent && this.currentPageComponent.ngOnInit) {
      this.currentPageComponent.ngOnInit();
    }
  }
}
