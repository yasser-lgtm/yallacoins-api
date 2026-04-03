import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, UseGuards, Request, Res, BadRequestException, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { extractUploadToken, validateUploadToken } from '../../common/utils/upload-token';
import type { Response } from 'express';

@Controller('files')
export class FileUploadController {
  constructor(
    private fileUploadService: FileUploadService,
    private jwtService: JwtService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Headers('authorization') authHeader?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Extract and validate upload token
    const token = extractUploadToken(authHeader);
    if (!token) {
      throw new BadRequestException('Upload token is required in Authorization header');
    }

    const tokenValidation = validateUploadToken(this.jwtService, token);
    if (!tokenValidation.valid) {
      throw new BadRequestException(tokenValidation.error || 'Invalid upload token');
    }

    const requestId = tokenValidation.requestId!;
    const ipAddress = this.getClientIp(req);

    return this.fileUploadService.uploadFile(file, requestId, ipAddress, token);
  }

  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.connection.remoteAddress ||
      'unknown'
    );
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
