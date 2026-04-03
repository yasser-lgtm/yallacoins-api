import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private uploadDir = process.env.UPLOAD_DIR || './uploads';
  private maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880') || 5242880; // 5MB

  constructor(
    @InjectRepository(FileUpload)
    private fileUploadsRepository: Repository<FileUpload>,
  ) {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, uploadedBy: string, relatedToRequestId?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const fileUpload = this.fileUploadsRepository.create({
      originalName: file.originalname,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      path: filepath,
      url: `/uploads/${filename}`,
      uploadedBy,
      relatedToRequestId,
    });

    return this.fileUploadsRepository.save(fileUpload);
  }

  async getFileById(id: string) {
    return this.fileUploadsRepository.findOne({ where: { id } });
  }

  async getFilesByRequestId(requestId: string) {
    return this.fileUploadsRepository.find({
      where: { relatedToRequestId: requestId },
    });
  }

  async deleteFile(id: string) {
    const file = await this.fileUploadsRepository.findOne({ where: { id } });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await this.fileUploadsRepository.remove(file);

    return { message: 'File deleted successfully' };
  }

  async getFileStream(filename: string) {
    const filepath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    return fs.createReadStream(filepath);
  }
}
