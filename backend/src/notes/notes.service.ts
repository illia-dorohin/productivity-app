import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

interface NoteFilters {
  from?: string;
  to?: string;
  tag?: string;
}

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async findAll(userId: string, filters: NoteFilters): Promise<NoteDocument[]> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (filters.from || filters.to) {
      const dateFilter: Record<string, string> = {};
      if (filters.from) dateFilter['$gte'] = filters.from;
      if (filters.to) dateFilter['$lte'] = filters.to;
      query['date'] = dateFilter;
    }

    if (filters.tag) query['tags'] = filters.tag;

    return this.noteModel.find(query).sort({ date: -1, createdAt: -1 });
  }

  async create(userId: string, dto: CreateNoteDto): Promise<NoteDocument> {
    const note = new this.noteModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
    return note.save();
  }

  async update(userId: string, id: string, dto: UpdateNoteDto): Promise<NoteDocument> {
    const note = await this.noteModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      dto,
      { new: true },
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.noteModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Note not found');
    }
  }
}
