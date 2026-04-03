import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RatesService } from './rates.service';
import { CreateAppRateDto } from './dto/create-app-rate.dto';
import { UpdateAppRateDto } from './dto/update-app-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('rates')
export class RatesController {
  constructor(private ratesService: RatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async createRate(@Body() dto: CreateAppRateDto) {
    return this.ratesService.createRate(dto);
  }

  @Get()
  async getAllRates() {
    return this.ratesService.getAllRates();
  }

  @Get(':appName')
  async getRateByAppName(@Param('appName') appName: string) {
    return this.ratesService.getRateByAppName(appName);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async updateRate(
    @Param('id') id: string,
    @Body() dto: UpdateAppRateDto,
    @Request() req,
  ) {
    return this.ratesService.updateRate(id, dto, req.user.id, req.user.name);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  async getRateHistory(@Param('id') id: string) {
    return this.ratesService.getRateHistory(id);
  }

  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async disableRate(@Param('id') id: string, @Request() req) {
    return this.ratesService.disableRate(id, req.user.id, req.user.name);
  }
}
