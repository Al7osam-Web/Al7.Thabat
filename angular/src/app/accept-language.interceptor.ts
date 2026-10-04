import { SessionStateService } from '@abp/ng.core';
import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AcceptLanguageInterceptor implements HttpInterceptor {
  constructor(private sessionState: SessionStateService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(
      request.clone({
        setHeaders: this.getAdditionalHeaders(request.headers),
      }),
    );
  }

  getAdditionalHeaders(existingHeaders?: HttpHeaders) {
    const headers = {} as any;

    // When sessionState.getLanguage() returns null at first initialization.
    // So you can set your default language as shown below:
    const lang = this.sessionState.getLanguage() || 'ar' // put your default language here.
    if (!existingHeaders?.has('Accept-Language')) {
      headers['Accept-Language'] = lang;
    }

    return headers;
  }
}