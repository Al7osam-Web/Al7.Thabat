import { CoreModule } from '@abp/ng.core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { StepsModule } from 'primeng/steps';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepperModule } from 'primeng/stepper';
import { PaginatorModule } from 'primeng/paginator';
import { ListboxModule } from 'primeng/listbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AbpValidationSummaryComponent } from './components/validation/abp-validation.summary.component';

import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FieldsetModule } from 'primeng/fieldset';
//import { MenuModule } from 'primeng/menu';

/** <--- Prime Ng ---> */
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { SearchPipe } from '../sharedFeatures/directives/SearchPipe';
// import { LeadStatusPipe, ParentTypePipe, ParentTypeTitlePipe, TaskStatusTitlePipe } from '../sharedFeatures/pipes/enums.pipe';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { GroupByMenuComponent } from './components/grid/group-by-menu/group-by-menu.component';
import { EnumFilterComponent } from './components/grid/enum-filter/enum-filter.component';
import { TextFilterComponent } from './components/grid/text-filter/text-filter.component';
import { CustomDropdwnComponent } from './components/custom-dropdwn/custom-dropdwn.component';
import { CustomSearchableDropdownComponent } from './components/custom-searchable-dropdown/custom-searchable-dropdown.component';
import { ButtonComponent } from './components/button/button.component';
import { ControlErrorDisplayComponent } from './components/control-error-display/control-error-display.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { GridComponent } from './components/grid/grid.component';
import { InputImageComponent } from './components/input-image/input-image.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { CustomInputFormComponent } from './components/custom-input-form/custom-input-form.component';
import { SearableDropdownComponent } from './components/searable-dropdown/searable-dropdown.component';
import { SharedRoutingModule } from './shared-routing.module';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TimeRemainingPipe } from '../sharedFeatures/pipes/time-remaining.pipe';
import { CustomInputTestComponent } from './components/custom-input-test/custom-input-test.component';
import { UserInfoFormComponent } from './components/user-info-form/user-info-form.component';
import { ValidationMessageComponent } from './components/validation-message/validation-message.component';
import { DateFormatPipe } from '../sharedFeatures/pipes/enums.pipe';
import { ImageModule } from 'primeng/image';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageModule } from 'primeng/message';
import { TreeModule  } from 'primeng/tree';
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import { TimelineModule } from 'primeng/timeline';
import { MomentUtcDatePipe } from '../sharedFeatures/directives/moment-utc-date.pipe';
import { MomentDatePipe } from '../sharedFeatures/directives/moment-date.pipe';

/** <--- Prime Ng ---> */

const PRIM_MODULES = [
  TableModule,
  AccordionModule,
  InputGroupAddonModule,
  TabViewModule,
  InputGroupModule,
  PasswordModule,
  ConfirmDialogModule,
  RatingModule,
  TagModule,
  FileUploadModule,
  BadgeModule,
  ProgressSpinnerModule,
  ProgressBarModule,
  ToastModule,
  ButtonModule,
  StepsModule,
  DropdownModule,
  SkeletonModule,
  MultiSelectModule,
  SelectButtonModule,
  EditorModule,
  InputSwitchModule,
  CheckboxModule,
  InputNumberModule,
  DialogModule,
  RippleModule,
  RadioButtonModule,
  CalendarModule,
  ToolbarModule,
  InputTextModule,
  InputTextareaModule,
  CardModule,
  AvatarModule,
  SplitButtonModule,
  StepperModule,
  PaginatorModule,
  FormsModule,
  ContextMenuModule,
  MenuModule,
  OverlayPanelModule,
  DynamicDialogModule,
  FieldsetModule,
  MenuModule,
  IconFieldModule,
  InputIconModule,
  ListboxModule,  BreadcrumbModule,
  ImageModule,
  MessageModule ,
  FilePondModule,
  TreeModule ,
  TimelineModule 
];
const Pipes_Files = [SearchPipe, TimeRemainingPipe, MomentDatePipe, MomentUtcDatePipe, DateFormatPipe];
@NgModule({
  declarations: [
    AbpValidationSummaryComponent,
    ValidationMessageComponent,
    ControlErrorDisplayComponent,
    PaginationComponent,
    DeleteModalComponent,
    GridComponent,
    GroupByMenuComponent,
    EnumFilterComponent,
    TextFilterComponent,
    CustomInputComponent,
    CustomInputTestComponent,
    CustomInputFormComponent,
    CustomDropdwnComponent,
    CustomSearchableDropdownComponent,
    ButtonComponent,
    InputImageComponent,
    SearableDropdownComponent,
    UserInfoFormComponent,

  ],
  imports: [
    CoreModule,
    CommonModule,
    SharedRoutingModule,
    ThemeSharedModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    TranslateModule,
    ReactiveFormsModule,
    ...PRIM_MODULES,
    Pipes_Files
  ],
  exports: [
    CoreModule,
    ThemeSharedModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    AbpValidationSummaryComponent,
    ValidationMessageComponent,
    ControlErrorDisplayComponent,
    PaginationComponent,
    DeleteModalComponent,
    GridComponent,
    GroupByMenuComponent,
    EnumFilterComponent,
    TextFilterComponent,
    CustomInputComponent,
    CustomInputTestComponent,
    CustomInputFormComponent,
    CustomDropdwnComponent,
    CustomSearchableDropdownComponent,
    ButtonComponent,
    InputImageComponent,
    SearableDropdownComponent,
    ReactiveFormsModule,
    UserInfoFormComponent,
    ...PRIM_MODULES,
    Pipes_Files

  ],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class SharedModule {}
