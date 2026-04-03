import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { PayoutMethod } from './entities/payout-method.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreatePayoutMethodDto } from './dto/create-payout-method.dto';
import { UpdatePayoutMethodDto } from './dto/update-payout-method.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
    @InjectRepository(PayoutMethod)
    private payoutMethodsRepository: Repository<PayoutMethod>,
    private auditLogService: AuditLogService,
  ) {}

  async createCountry(dto: CreateCountryDto) {
    const existingCountry = await this.countriesRepository.findOne({
      where: { code: dto.code },
    });

    if (existingCountry) {
      throw new BadRequestException(`Country with code ${dto.code} already exists`);
    }

    const country = this.countriesRepository.create(dto);
    return this.countriesRepository.save(country);
  }

  async getCountry(code: string) {
    const country = await this.countriesRepository.findOne({
      where: { code, active: true },
      relations: ['payoutMethods'],
    });

    if (!country) {
      throw new NotFoundException(`Country not found: ${code}`);
    }

    return country;
  }

  async getAllCountries() {
    return this.countriesRepository.find({
      where: { active: true },
      relations: ['payoutMethods'],
      order: { name: 'ASC' },
    });
  }

  async createPayoutMethod(countryCode: string, dto: CreatePayoutMethodDto, adminId: string, adminName: string) {
    const country = await this.countriesRepository.findOne({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country not found: ${countryCode}`);
    }

    const existingMethod = await this.payoutMethodsRepository.findOne({
      where: { name: dto.name, countryId: country.id },
    });

    if (existingMethod) {
      throw new BadRequestException(`Payout method ${dto.name} already exists for this country`);
    }

    const method = this.payoutMethodsRepository.create({
      ...dto,
      country,
      countryId: country.id,
    });

    const saved = await this.payoutMethodsRepository.save(method);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.PAYOUT_METHOD_CREATED,
      entityType: 'payout_method',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getPayoutMethod(methodName: string, countryCode: string) {
    const country = await this.countriesRepository.findOne({
      where: { code: countryCode },
    });

    if (!country) {
      throw new NotFoundException(`Country not found: ${countryCode}`);
    }

    const method = await this.payoutMethodsRepository.findOne({
      where: { name: methodName, countryId: country.id, active: true },
    });

    if (!method) {
      throw new NotFoundException(`Payout method not found: ${methodName}`);
    }

    return method;
  }

  async getCountryPayoutMethods(countryCode: string) {
    const country = await this.countriesRepository.findOne({
      where: { code: countryCode },
      relations: ['payoutMethods'],
    });

    if (!country) {
      throw new NotFoundException(`Country not found: ${countryCode}`);
    }

    return country.payoutMethods.filter((m) => m.active).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async updatePayoutMethod(id: string, dto: UpdatePayoutMethodDto, adminId: string, adminName: string) {
    const method = await this.payoutMethodsRepository.findOne({ where: { id } });

    if (!method) {
      throw new NotFoundException('Payout method not found');
    }

    const oldMethod = { ...method };

    Object.assign(method, dto);

    const updated = await this.payoutMethodsRepository.save(method);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.PAYOUT_METHOD_UPDATED,
      entityType: 'payout_method',
      entityId: id,
      oldValue: oldMethod,
      newValue: updated,
    });

    return updated;
  }

  async deactivatePayoutMethod(id: string, adminId: string, adminName: string) {
    const method = await this.payoutMethodsRepository.findOne({ where: { id } });

    if (!method) {
      throw new NotFoundException('Payout method not found');
    }

    method.active = false;

    const updated = await this.payoutMethodsRepository.save(method);

    await this.auditLogService.log({
      userId: adminId,
      userName: adminName,
      action: AuditAction.PAYOUT_METHOD_UPDATED,
      entityType: 'payout_method',
      entityId: id,
      oldValue: { active: true },
      newValue: { active: false },
    });

    return updated;
  }
}
