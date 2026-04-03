import { IsString, IsOptional } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  currency: string;

  @IsOptional()
  active?: boolean;
}
