import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../interfaces/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private STORAGE_KEY = 'tasks';

  private taskSubject = new BehaviorSubject<Task[]>([]);

  task$ = this.taskSubject.asObservable();

  constructor() {
    this.getFromLocal();
  }

  postToLocal(data: Task) {
    const existingData = this.getTasks();
    existingData.push(data);
    this.saveAndNotify(existingData);
  }

  deleteTask(index: number) {
    const existingData = this.getTasks();
    existingData.splice(index, 1);
    this.saveAndNotify(existingData);
  }

  updateTaskTitle(index: number, newTitle: string) {
    const existingData = this.getTasks();
    if (existingData[index]) {
      existingData[index].task = newTitle;
      this.saveAndNotify(existingData);
    }
  }

  updateTaskDescription(index: number, description: string) {
    const existingData = this.getTasks();
    if (existingData[index]) {
      existingData[index].description = description;
      this.saveAndNotify(existingData);
    }
  }


  addSubTask(taskIndex: number, subTaskText: string) {
    const existingData = this.getTasks();
    if (existingData[taskIndex]) {
      if (!existingData[taskIndex].subTasks) {
        existingData[taskIndex].subTasks = [];
      }
      existingData[taskIndex].subTasks.push(subTaskText);
      this.saveAndNotify(existingData);
    }
  }

  deleteSubTask(taskIndex: number, subTaskIndex: number) {
    const existingData = this.getTasks();
    if (existingData[taskIndex] && existingData[taskIndex].subTasks) {
      existingData[taskIndex].subTasks.splice(subTaskIndex, 1);
      this.saveAndNotify(existingData);
    }
  }

  updateSubTaskText(taskIndex: number, subTaskIndex: number, newSubTaskText: string) {
    const existingData = this.getTasks();
    if (existingData[taskIndex] && existingData[taskIndex].subTasks) {
      existingData[taskIndex].subTasks[subTaskIndex] = newSubTaskText;
      this.saveAndNotify(existingData);
    }
  }

  private saveAndNotify(data: Task[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.taskSubject.next(data);
  }

  getFromLocal() {
    const data = this.getTasks();
    this.taskSubject.next(data);
  }

  private getTasks(): Task[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data) as any[];
      return parsed.map(item => {
        if (!item.subTasks) {
          item.subTasks = item.subTask ? [item.subTask] : [];
        }
        return item as Task;
      });
    } catch {
      return [];
    }
  }
}