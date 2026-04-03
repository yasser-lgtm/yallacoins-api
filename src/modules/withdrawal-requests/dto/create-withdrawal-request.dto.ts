import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsString()
  app: string; // 'bigo', 'kiti', 'xena'

  @IsString()
  accountId: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  country: string;

  @IsString()
  payoutMethod: string;

  @IsString()
  payoutInfo: string;

  @IsNumber()
  @IsPositive()
  amountInBeans: number;

  @IsOptional()
  @IsString()
  proofFileId?: string;
}
