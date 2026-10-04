import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { Observable, pipe, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalizationService } from '@abp/ng.core';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpServiceService {
  private currentUser: string = 'currentUser';
  User: {} | undefined;
  constructor(private _http: HttpClient,  private localizationService: LocalizationService) {}

  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      language: 'ar',
    }),
  };

  private setHeaders(): void {
    let currentLang = this.localizationService.currentLang;
    let currentUser = localStorage.getItem(this.currentUser);
    this.User = currentUser != null ? JSON.parse(currentUser) : '';
    if (this.User ) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          language: currentLang,
          Lang: currentLang,
         /*  'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${this.User.Data.Access_Token}`, */
        }),
      };

      /*   this.httpOptions.headers.set(
        'Authorization',
        'Bearer ' + this.User.Data.Access_Token
      ); */
    } else {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          language: currentLang,
          Lang: currentLang,
        }),
      };
    }
  }

  protected getData<T>(url: string): Observable<T> {
    this.setHeaders();
    return this._http.get<T>(url, this.httpOptions).pipe(
      tap(result => {
        //console.log(`getData() => Data fetched.`);
      }),
      catchError(this.handleError<T>(`getData`))
    );
  }

  protected postData<T>(url: string, data: any): Observable<T> {
    this.setHeaders();
    return this._http.post<T>(url, data, this.httpOptions).pipe(
      tap(result => {
        // console.log(`postData() => Data fetched.`);
      }),
      catchError(this.handleError<T>(`postData`))
    );
  }

  protected putData<T>(url: string, data: T): Observable<T> {
    this.setHeaders();
    return this._http.put<T>(url, data, this.httpOptions).pipe(
      tap(result => {
        //console.log(`putData() => Data fetched.`);
      }),
      catchError(this.handleError<T>(`putData`))
    );
  }

  protected exportData<T>(url: string, model: T) {
    this.setHeaders();
    return this._http
      .post(url, model, {
        responseType: 'blob',
        headers: this.httpOptions.headers,
      })
      .pipe(
        tap(data => console.log('export data: ' + data)),
        catchError(this.handleError<any>(`exportData`))
      );
  }
  protected download(url: string): Observable<Blob> {
    this.setHeaders();
    return this._http.get(url, { responseType: 'blob', headers: this.httpOptions.headers }).pipe(
      tap(data => console.log('download: ' + data)),
      catchError(this.handleError<any>(`download`))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      if (error.status == 401) {
        // this._currentUserService.logOut();
        //logout
        return new Observable();
      } else {
        // TODO: send the error to remote logging infrastructure
        //console.error(JSON.stringify(error)); // log to console instead

        // TODO: better job of transforming error for user consumption
        //this.log(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        //return of(result as T);
        throw error;
      }
    };
  }
  protected postDataUpload<T>(url: string, data: any): Observable<T> {
    let currentLang = this.localizationService.currentLang;
    let currentUser = localStorage.getItem(this.currentUser);
    this.User = currentUser != null ? JSON.parse(currentUser) : '';
   // if (this.User && this.User.Data.Access_Token != undefined) {
      if (this.User ) {
      this.httpOptions = {
        headers: new HttpHeaders({
          language: currentLang,
          Lang: currentLang,
         /*  'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${this.User.Data.Access_Token}`, */
        }),
      };
    } else {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          language: currentLang,
          Lang: currentLang,
        }),
      };
    }
    return this._http.post<T>(url, data, this.httpOptions).pipe(
      tap(result => {
        // console.log(`postData() => Data fetched.`);
      }),
      catchError(this.handleError<T>(`postData`))
    );
  }

  // protected oldBaseUrl: string = `http://41.38.102.53:4422/`;
  protected baseUrl: string = `${environment.APIUrl}/api`;
  protected ReaderUrl: string = `${environment.ReaderAPIUrl}/api`;

  protected reportUrl: string = `${environment.ReportUrl}/api`;
  domainUrl: string = environment.APIUrl;
}
