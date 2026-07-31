import fs from 'fs';
import path from 'path';
import os from 'os';
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
    const rawPath = data.path.trim();
    let finalPath = path.normalize(rawPath);

    // Smart path resolution
    if (!fs.existsSync(finalPath)) {
      const cwdResolved = path.resolve(process.cwd(), rawPath);
      const homeResolved = path.join(os.homedir(), rawPath);

      if (fs.existsSync(cwdResolved)) {
        finalPath = cwdResolved;
      } else if (fs.existsSync(homeResolved)) {
        finalPath = homeResolved;
      } else {
        // Automatically create folder if user entered a new valid directory name
        try {
          fs.mkdirSync(finalPath, { recursive: true });
        } catch (err) {
          try {
            finalPath = cwdResolved;
            fs.mkdirSync(finalPath, { recursive: true });
          } catch (mkdirErr: any) {
            throw new AppError(`Không thể tạo hoặc truy cập thư mục: "${rawPath}". Chi tiết: ${mkdirErr.message}`, 400);
          }
        }
      }
    }

    const stat = fs.statSync(finalPath);
    if (!stat.isDirectory()) {
      throw new AppError(`Đường dẫn được chọn không phải là một thư mục: "${finalPath}"`, 400);
    }

    const existing = await this.sourcesRepository.findByPath(finalPath);
    if (existing) {
      throw new AppError(`Thư mục này đã được thêm làm nguồn nhạc trước đó: "${finalPath}"`, 400);
    }

    return this.sourcesRepository.create({
      name: data.name.trim(),
      path: finalPath,
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
