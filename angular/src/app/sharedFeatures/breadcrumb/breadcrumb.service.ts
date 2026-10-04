import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<MenuItem[]>([]);
  breadcrumb$ = this.breadcrumbSubject.asObservable();

  setBreadcrumb(breadcrumbs: MenuItem[]) {
    this.breadcrumbSubject.next(breadcrumbs);
  }

  clearBreadcrumb() {
    this.breadcrumbSubject.next([]);
  }

}
