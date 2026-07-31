import fs from 'fs';
import path from 'path';
import { Source } from '@prisma/client';
import { ISourcesRepository } from './sources.repository.interface.js';
import { CreateSourceDTO, UpdateSourceDTO } from './sources.schema.js';
import { AppError, NotFoundError } from '../../shared/errors/app-error.js';

export class SourcesService {
  constructor(private readonly sourcesRepository: ISourcesRepository) {}

  async getAllSources() {
    return this.sourcesRepository.findAll();
  }

  async getSourceById(id: string): Promise<Source> {
    const source = await this.sourcesRepository.findById(id);
    if (!source) {
      throw new NotFoundError(`Không tìm thấy nguồn nhạc có ID ${id}`);
    }
    return source;
  }

  async createSource(data: CreateSourceDTO): Promise<Source> {
    const normalizedPath = path.normalize(data.path.trim());
    
    if (!fs.existsSync(normalizedPath)) {
      throw new AppError(`Đường dẫn thư mục không tồn tại trên hệ thống: "${normalizedPath}". Vui lòng sử dụng tính năng "Duyệt Thư Mục" hoặc nhập đường dẫn tuyệt đối (VD: D:\\Music).`, 400);
    }

    const stat = fs.statSync(normalizedPath);
    if (!stat.isDirectory()) {
      throw new AppError(`Đường dẫn được chọn không phải là một thư mục: "${normalizedPath}"`, 400);
    }

    const existing = await this.sourcesRepository.findByPath(normalizedPath);
    if (existing) {
      throw new AppError(`Thư mục này đã được thêm làm nguồn nhạc trước đó: "${normalizedPath}"`, 400);
    }

    return this.sourcesRepository.create({
      name: data.name.trim(),
      path: normalizedPath,
    });
  }

  async updateSource(id: string, data: UpdateSourceDTO): Promise<Source> {
    await this.getSourceById(id);
    return this.sourcesRepository.update(id, data);
  }

  async deleteSource(id: string): Promise<boolean> {
    await this.getSourceById(id);
    return this.sourcesRepository.delete(id);
  }

  async getSourceStats(id: string) {
    await this.getSourceById(id);
    return this.sourcesRepository.getStats(id);
  }
}
