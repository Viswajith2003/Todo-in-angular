import { Component, signal } from '@angular/core';
import { TodoComponent } from './todo/todo';

@Component({
  selector: 'app-root',
  imports: [TodoComponent],
  template: '<app-todo></app-todo>',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-learning');
}

