import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesApiService } from '../../core/api/notes.service';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-notes',
  imports: [DatePipe, FormsModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent implements OnInit {
  private readonly notesApi = inject(NotesApiService);

  readonly notes = signal<Note[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);

  newText = '';
  newDate = new Date().toISOString().split('T')[0];
  newTags = '';

  ngOnInit(): void {
    this.loadNotes();
  }

  async loadNotes(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.notesApi.getAll();
      this.notes.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async createNote(): Promise<void> {
    if (!this.newText.trim()) return;

    const tags = this.newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await this.notesApi.create({
      text: this.newText.trim(),
      date: this.newDate,
      tags: tags.length > 0 ? tags : undefined,
    });

    this.resetForm();
    await this.loadNotes();
  }

  async deleteNote(id: string): Promise<void> {
    await this.notesApi.delete(id);
    await this.loadNotes();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) this.resetForm();
  }

  private resetForm(): void {
    this.newText = '';
    this.newDate = new Date().toISOString().split('T')[0];
    this.newTags = '';
    this.showForm.set(false);
  }
}
