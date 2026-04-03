import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreatePayoutMethodDto } from './dto/create-payout-method.dto';
import { UpdatePayoutMethodDto } from './dto/update-payout-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async createCountry(@Body() dto: CreateCountryDto) {
    return this.countriesService.createCountry(dto);
  }

  @Get()
  async getAllCountries() {
    return this.countriesService.getAllCountries();
  }

  @Get(':code')
  async getCountry(@Param('code') code: string) {
    return this.countriesService.getCountry(code);
  }

  @Get(':code/payout-methods')
  async getCountryPayoutMethods(@Param('code') code: string) {
    return this.countriesService.getCountryPayoutMethods(code);
  }

  @Post(':code/payout-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async createPayoutMethod(
    @Param('code') code: string,
    @Body() dto: CreatePayoutMethodDto,
    @Request() req,
  ) {
    return this.countriesService.createPayoutMethod(code, dto, req.user.id, req.user.name);
  }

  @Patch('payout-methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async updatePayoutMethod(
    @Param('id') id: string,
    @Body() dto: UpdatePayoutMethodDto,
    @Request() req,
  ) {
    return this.countriesService.updatePayoutMethod(id, dto, req.user.id, req.user.name);
  }

  @Patch('payout-methods/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RATE_MANAGER)
  async deactivatePayoutMethod(@Param('id') id: string, @Request() req) {
    return this.countriesService.deactivatePayoutMethod(id, req.user.id, req.user.name);
  }
}
