import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('tag') tag?: string,
  ) {
    const data = await this.tasksService.findAll(user.userId, {
      status,
      priority,
      tag,
    });
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTaskDto,
  ) {
    const data = await this.tasksService.create(user.userId, dto);
    return { data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const data = await this.tasksService.update(user.userId, id, dto);
    return { data };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    await this.tasksService.delete(user.userId, id);
    return { data: null };
  }

  @Post('reorder')
  async reorder(
    @CurrentUser() user: { userId: string },
    @Body() dto: ReorderTasksDto,
  ) {
    await this.tasksService.reorder(user.userId, dto);
    return { data: null };
  }
}
