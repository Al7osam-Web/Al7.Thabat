import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { BooksRoutingModule } from './books-routing.module';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookMediaDialogComponent } from './components/book-media-dialog/book-media-dialog.component';
import { BooksListComponent } from './components/books-list/books-list.component';

@NgModule({
  declarations: [BooksListComponent, BookFormComponent, BookMediaDialogComponent],
  imports: [CommonModule, SharedModule, BooksRoutingModule],
})
export class BooksModule {}
