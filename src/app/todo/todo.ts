import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  imports: [FormsModule],
  templateUrl: './todo.html',
})
export class Todo {
  todos = signal<{ text: string; completed: boolean }[]>([]);
  newTodoText = '';

  addTodo() {
    const text = this.newTodoText.trim();
    if (text) {
      this.todos.update(list => [...list, { text, completed: false }]);
      this.newTodoText = '';
    }
  }

  editTodo(index: number) {
    this.todos.update(list =>
      list.map((todo, i) => (i === index ? { ...todo, completed: !todo.completed } : todo))
    );
  }

  removeTodo(index: number) {
    this.todos.update(list => list.filter((_, i) => i !== index));
  }
}
