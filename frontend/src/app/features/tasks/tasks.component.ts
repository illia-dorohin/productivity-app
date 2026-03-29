import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksApiService } from '../../core/api/tasks.service';
import { Task, TaskStatus, TaskPriority } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  imports: [DatePipe, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  private readonly tasksApi = inject(TasksApiService);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editingTask = signal<Task | null>(null);

  newTitle = '';
  newDescription = '';
  newPriority: TaskPriority | '' = '';
  newDeadline = '';

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.tasksApi.getAll();
      this.tasks.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(task: Task): Promise<void> {
    const nextStatus: TaskStatus = task.status === 'done' ? 'not_started' : 'done';
    await this.tasksApi.update(task._id, { status: nextStatus });
    await this.loadTasks();
  }

  async createTask(): Promise<void> {
    if (!this.newTitle.trim()) return;

    await this.tasksApi.create({
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      priority: this.newPriority || undefined,
      deadline: this.newDeadline || undefined,
    });

    this.resetForm();
    await this.loadTasks();
  }

  async deleteTask(id: string): Promise<void> {
    await this.tasksApi.delete(id);
    await this.loadTasks();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.resetForm();
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'done': return '✓';
      case 'in_progress': return '◐';
      default: return '○';
    }
  }

  getPriorityLabel(priority?: TaskPriority): string {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return '';
    }
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newPriority = '';
    this.newDeadline = '';
    this.showForm.set(false);
  }
}
