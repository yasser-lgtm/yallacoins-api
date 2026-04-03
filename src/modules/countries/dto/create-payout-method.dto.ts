import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { FeeType } from '../entities/payout-method.entity';

export class CreatePayoutMethodDto {
  @IsString()
  name: string;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsNumber()
  feeValue: number;

  @IsString()
  etaText: string;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
