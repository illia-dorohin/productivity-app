import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

interface TaskFilters {
  status?: string;
  priority?: string;
  tag?: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async findAll(userId: string, filters: TaskFilters): Promise<TaskDocument[]> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (filters.status) query['status'] = filters.status;
    if (filters.priority) query['priority'] = filters.priority;
    if (filters.tag) query['tags'] = filters.tag;

    return this.taskModel.find(query).sort({ order: 1 });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const lastTask = await this.taskModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = new this.taskModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      order,
    });
    return task.save();
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      dto,
      { new: true },
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }

  async reorder(userId: string, dto: ReorderTasksDto): Promise<void> {
    const bulkOps = dto.items.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.id),
          userId: new Types.ObjectId(userId),
        },
        update: { order: item.order },
      },
    }));

    await this.taskModel.bulkWrite(bulkOps);
  }
}
