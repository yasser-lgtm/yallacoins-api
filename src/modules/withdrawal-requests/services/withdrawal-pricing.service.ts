import { Injectable, BadRequestException } from '@nestjs/common';
import { RatesService } from '../../rates/rates.service';
import { CountriesService } from '../../countries/countries.service';

export interface PricingCalculation {
  amountInBeans: number;
  conversionRate: number;
  usdBeforeAppFee: number;
  appFeeAmount: number;
  usdAfterAppFee: number;
  payoutFeeAmount: number;
  finalUsdAmount: number;
}

/**
 * WITHDRAWAL PRICING SERVICE
 * 
 * Handles all pricing calculations for withdrawal requests:
 * - Conversion from beans to USD
 * - App fee calculation
 * - Payout method fee calculation
 * - Final amount determination
 * 
 * Separated from WithdrawalRequestsService for single responsibility.
 */
@Injectable()
export class WithdrawalPricingService {
  constructor(
    private ratesService: RatesService,
    private countriesService: CountriesService,
  ) {}

  /**
   * Calculate complete pricing for a withdrawal request
   */
  async calculatePricing(
    amountInBeans: number,
    appName: string,
    payoutMethodId: string,
    country: string,
  ): Promise<PricingCalculation> {
    // Get app rate
    const appRate = await this.ratesService.getRateByAppName(appName);
    if (!appRate) {
      throw new BadRequestException(`App rate not found for ${appName}`);
    }

    // Get payout method
    const payoutMethod = await this.countriesService.getPayoutMethod(payoutMethodId, country);
    if (!payoutMethod) {
      throw new BadRequestException('Payout method not found');
    }

    // Calculate conversion
    const conversionRate = appRate.publicRate;
    const usdBeforeAppFee = amountInBeans * conversionRate;
    const appFeeAmount = (usdBeforeAppFee * appRate.feeValue) / 100;
    const usdAfterAppFee = usdBeforeAppFee - appFeeAmount;

    // Calculate payout fee
    let payoutFeeAmount = 0;
    if (payoutMethod.feeType === 'fixed') {
      payoutFeeAmount = payoutMethod.feeValue;
    } else {
      payoutFeeAmount = (usdAfterAppFee * payoutMethod.feeValue) / 100;
    }

    const finalUsdAmount = usdAfterAppFee - payoutFeeAmount;

    return {
      amountInBeans,
      conversionRate,
      usdBeforeAppFee,
      appFeeAmount,
      usdAfterAppFee,
      payoutFeeAmount,
      finalUsdAmount,
    };
  }

  /**
   * Validate pricing calculation
   */
  validatePricing(pricing: PricingCalculation): boolean {
    return (
      pricing.amountInBeans > 0 &&
      pricing.conversionRate > 0 &&
      pricing.usdBeforeAppFee > 0 &&
      pricing.appFeeAmount >= 0 &&
      pricing.usdAfterAppFee > 0 &&
      pricing.payoutFeeAmount >= 0 &&
      pricing.finalUsdAmount > 0
    );
  }
}
