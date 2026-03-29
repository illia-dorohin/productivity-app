import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Metric, MetricDocument } from './schemas/metric.schema';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { ReorderMetricsDto } from './dto/reorder-metrics.dto';

export interface MetricTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  weight: number;
  order: number;
  isActive: boolean;
  children: MetricTreeNode[];
}

const DEFAULT_METRICS = [
  {
    name: 'Productivity',
    slug: 'productivity',
    type: 'group' as const,
    order: 0,
    children: [
      { name: 'Work', slug: 'work', type: 'rating' as const, order: 0 },
      {
        name: 'Additional Activities',
        slug: 'additional-activities',
        type: 'group' as const,
        order: 1,
        children: [
          { name: 'Drone Factory', slug: 'drone-factory', type: 'rating' as const, order: 0 },
          { name: 'Glass', slug: 'glass', type: 'rating' as const, order: 1 },
          { name: 'Creativity', slug: 'creativity', type: 'rating' as const, order: 2 },
          { name: 'Other Activities', slug: 'other-activities', type: 'rating' as const, order: 3 },
        ],
      },
    ],
  },
  {
    name: 'Brain Rot',
    slug: 'brain-rot',
    type: 'group' as const,
    order: 1,
    children: [
      { name: 'Computer Games', slug: 'computer-games', type: 'rating' as const, order: 0, description: '+2 = didn\'t play' },
      { name: 'Other Destructive Activities', slug: 'other-destructive', type: 'rating' as const, order: 1, description: '+2 = no time wasted' },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    type: 'group' as const,
    order: 2,
    children: [
      { name: 'Sport', slug: 'sport', type: 'rating' as const, order: 0 },
    ],
  },
  {
    name: 'Mental Health',
    slug: 'mental-health',
    type: 'rating' as const,
    order: 3,
  },
  {
    name: 'Relationships',
    slug: 'relationships',
    type: 'group' as const,
    order: 4,
    children: [
      { name: 'Communication with Partner', slug: 'communication-partner', type: 'rating' as const, order: 0 },
      { name: 'Actions towards Partner', slug: 'actions-partner', type: 'rating' as const, order: 1 },
    ],
  },
];

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric.name) private readonly metricModel: Model<MetricDocument>,
  ) {}

  async getTree(userId: string): Promise<MetricTreeNode[]> {
    const metrics = await this.metricModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ order: 1 })
      .lean<Array<Record<string, unknown>>>();

    return this.buildTree(metrics);
  }

  async getAll(userId: string): Promise<MetricDocument[]> {
    return this.metricModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ order: 1 });
  }

  async create(userId: string, dto: CreateMetricDto): Promise<MetricDocument> {
    const metric = new this.metricModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
    });
    return metric.save();
  }

  async update(userId: string, id: string, dto: UpdateMetricDto): Promise<MetricDocument> {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.parentId !== undefined) {
      updateData['parentId'] = dto.parentId ? new Types.ObjectId(dto.parentId) : null;
    }

    const metric = await this.metricModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      updateData,
      { new: true },
    );

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }
    return metric;
  }

  async softDelete(userId: string, id: string): Promise<MetricDocument> {
    const metric = await this.metricModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { isActive: false },
      { new: true },
    );

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }
    return metric;
  }

  async reorder(userId: string, dto: ReorderMetricsDto): Promise<void> {
    const bulkOps = dto.items.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.id),
          userId: new Types.ObjectId(userId),
        },
        update: {
          order: item.order,
          ...(item.parentId !== undefined && {
            parentId: item.parentId ? new Types.ObjectId(item.parentId) : null,
          }),
        },
      },
    }));

    await this.metricModel.bulkWrite(bulkOps);
  }

  async seed(userId: string): Promise<MetricTreeNode[]> {
    const existing = await this.metricModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (existing) {
      return this.getTree(userId);
    }

    await this.createMetricsRecursive(userId, DEFAULT_METRICS, null);
    return this.getTree(userId);
  }

  private async createMetricsRecursive(
    userId: string,
    metrics: ReadonlyArray<{
      name: string;
      slug: string;
      type: 'group' | 'rating';
      order: number;
      description?: string;
      children?: ReadonlyArray<{
        name: string;
        slug: string;
        type: 'group' | 'rating';
        order: number;
        description?: string;
        children?: ReadonlyArray<{
          name: string;
          slug: string;
          type: 'group' | 'rating';
          order: number;
          description?: string;
        }>;
      }>;
    }>,
    parentId: Types.ObjectId | null,
  ): Promise<void> {
    for (const m of metrics) {
      const created = await this.metricModel.create({
        userId: new Types.ObjectId(userId),
        name: m.name,
        slug: m.slug,
        type: m.type,
        order: m.order,
        description: m.description,
        parentId,
      });

      if ('children' in m && m.children) {
        await this.createMetricsRecursive(userId, m.children, created._id);
      }
    }
  }

  private buildTree(metrics: Array<Record<string, unknown>>): MetricTreeNode[] {
    const map = new Map<string, MetricTreeNode>();
    const roots: MetricTreeNode[] = [];

    for (const m of metrics) {
      map.set(String(m['_id']), {
        _id: String(m['_id']),
        name: m['name'] as string,
        slug: m['slug'] as string,
        description: m['description'] as string | undefined,
        type: m['type'] as string,
        weight: m['weight'] as number,
        order: m['order'] as number,
        isActive: m['isActive'] as boolean,
        children: [],
      });
    }

    for (const m of metrics) {
      const node = map.get(String(m['_id']))!;
      const parentId = m['parentId'] ? String(m['parentId']) : null;

      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
