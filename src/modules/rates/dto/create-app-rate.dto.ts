import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateAppRateDto {
  @IsString()
  appName: string;

  @IsString()
  conversionUnitLabel: string;

  @IsString()
  conversionLogic: string;

  @IsNumber()
  @IsPositive()
  publicRate: number;

  @IsNumber()
  @IsPositive()
  internalRate: number;

  @IsNumber()
  @IsPositive()
  feeValue: number;

  @IsNumber()
  @IsPositive()
  minimumWithdrawal: number;

  @IsString()
  etaText: string;

  @IsOptional()
  @IsString()
  publicNote?: string;
}
