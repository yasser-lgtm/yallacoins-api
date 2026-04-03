import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('files')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!req.user?.id) {
      throw new BadRequestException('User authentication required for file upload');
    }
    const requestId = req.query.requestId as string;
    return this.fileUploadService.uploadFile(file, req.user.id, requestId);
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    return this.fileUploadService.getFileById(id);
  }

  @Get('request/:requestId')
  async getFilesByRequest(@Param('requestId') requestId: string) {
    return this.fileUploadService.getFilesByRequestId(requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string) {
    return this.fileUploadService.deleteFile(id);
  }

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stream = await this.fileUploadService.getFileStream(filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      stream.pipe(res);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }
}
