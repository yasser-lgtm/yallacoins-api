import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePayoutMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  feeValue?: number;

  @IsOptional()
  @IsString()
  etaText?: string;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
