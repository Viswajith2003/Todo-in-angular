import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.services';
import { Task } from '../interfaces/task.interface';
import { RoosterEditorComponent } from '../rooster-editor/rooster-editor';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RoosterEditorComponent
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class TodoComponent implements OnInit {

  taskForm!: FormGroup;

  tasks: Task[] = [];

  // Edit states
  editingTaskIndex: number | null = null;
  editingSubTaskIndex: { taskIndex: number; subTaskIndex: number } | null = null;
  addingSubTaskIndex: number | null = null;

  editTaskValue = '';
  editDescriptionValue = '';
  editSubTaskValue = '';
  newSubTaskText = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {

    this.taskForm = this.fb.group({
      task: ['', Validators.required],
      description: ['']
    });

    this.taskService.task$
      .subscribe(data => {
        this.tasks = data;
      });

    this.taskService.getFromLocal();
  }

  saveTask() {

    if (this.taskForm.invalid) {
      return;
    }

    this.taskService.postToLocal({
      task: this.taskForm.value.task,
      description: this.taskForm.value.description || '',
      subTasks: []
    });

    this.taskForm.reset();
  }

  // Task actions
  deleteTask(index: number) {
    this.taskService.deleteTask(index);
    this.cancelTaskEdit();
  }

  startTaskEdit(index: number, val: string, description: string = '') {
    this.editingTaskIndex = index;
    this.editTaskValue = val;
    this.editDescriptionValue = description;
  }

  cancelTaskEdit() {
    this.editingTaskIndex = null;
    this.editTaskValue = '';
    this.editDescriptionValue = '';
  }

  saveTaskEdit(index: number) {
    const trimmed = this.editTaskValue.trim();
    if (trimmed) {
      this.taskService.updateTaskTitle(index, trimmed);
      this.taskService.updateTaskDescription(index, this.editDescriptionValue);
      this.cancelTaskEdit();
    }
  }


  // Sub-task actions
  deleteSubTask(taskIndex: number, subTaskIndex: number) {
    this.taskService.deleteSubTask(taskIndex, subTaskIndex);
    this.cancelSubTaskEdit();
  }

  startSubTaskEdit(taskIndex: number, subTaskIndex: number, val: string) {
    this.editingSubTaskIndex = { taskIndex, subTaskIndex };
    this.editSubTaskValue = val;
  }

  cancelSubTaskEdit() {
    this.editingSubTaskIndex = null;
    this.editSubTaskValue = '';
  }

  saveSubTaskEdit(taskIndex: number, subTaskIndex: number) {
    const trimmed = this.editSubTaskValue.trim();
    if (trimmed) {
      this.taskService.updateSubTaskText(taskIndex, subTaskIndex, trimmed);
      this.cancelSubTaskEdit();
    }
  }

  // Add new sub-task actions
  startNewSubTask(taskIndex: number) {
    this.addingSubTaskIndex = taskIndex;
    this.newSubTaskText = '';
  }

  cancelNewSubTask() {
    this.addingSubTaskIndex = null;
    this.newSubTaskText = '';
  }

  saveNewSubTask(taskIndex: number) {
    const trimmed = this.newSubTaskText.trim();
    if (trimmed) {
      this.taskService.addSubTask(taskIndex, trimmed);
      this.cancelNewSubTask();
    }
  }
}