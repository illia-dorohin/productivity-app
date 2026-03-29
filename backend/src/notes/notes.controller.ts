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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tag') tag?: string,
  ) {
    const data = await this.notesService.findAll(user.userId, {
      from,
      to,
      tag,
    });
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateNoteDto,
  ) {
    const data = await this.notesService.create(user.userId, dto);
    return { data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    const data = await this.notesService.update(user.userId, id, dto);
    return { data };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    await this.notesService.delete(user.userId, id);
    return { data: null };
  }
}
