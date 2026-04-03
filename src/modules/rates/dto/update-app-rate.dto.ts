import { IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateAppRateDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  publicRate?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  internalRate?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  feeValue?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minimumWithdrawal?: number;

  @IsOptional()
  @IsString()
  etaText?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
