import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { RatesService } from '../modules/rates/rates.service';
import { CountriesService } from '../modules/countries/countries.service';
import { UserRole } from '../modules/auth/entities/user.entity';
import { FeeType } from '../modules/countries/entities/payout-method.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);

  const authService = app.get(AuthService);
  const ratesService = app.get(RatesService);
  const countriesService = app.get(CountriesService);

  console.log('🌱 Starting database seed...');

  try {
    // Create admin users
    console.log('👤 Creating admin users...');

    const adminUsers = [
      {
        name: 'Super Admin',
        email: 'admin@yallacoins.com',
        password: 'SuperAdmin123!',
        role: UserRole.SUPER_ADMIN,
        phone: '+1234567890',
      },
      {
        name: 'Ahmed Operations',
        email: 'ahmed@yallacoins.com',
        password: 'Operations123!',
        role: UserRole.OPERATIONS_ADMIN,
        phone: '+1234567891',
      },
      {
        name: 'Finance Manager',
        email: 'finance@yallacoins.com',
        password: 'Finance123!',
        role: UserRole.FINANCE_ADMIN,
        phone: '+1234567892',
      },
      {
        name: 'Rate Manager',
        email: 'rates@yallacoins.com',
        password: 'Rates123!',
        role: UserRole.RATE_MANAGER,
        phone: '+1234567893',
      },
      {
        name: 'Support Agent',
        email: 'support@yallacoins.com',
        password: 'Support123!',
        role: UserRole.SUPPORT_AGENT,
        phone: '+1234567894',
      },
      {
        name: 'Auditor',
        email: 'auditor@yallacoins.com',
        password: 'Auditor123!',
        role: UserRole.AUDITOR,
        phone: '+1234567895',
      },
    ];

    for (const user of adminUsers) {
      try {
        await authService.createUser(user);
        console.log(`✓ Created user: ${user.email}`);
      } catch (error) {
        console.log(`⚠ User already exists: ${user.email}`);
      }
    }

    // Create app rates
    console.log('💰 Creating app rates...');

    const appRates = [
      {
        appName: 'bigo',
        conversionUnitLabel: 'Beans',
        conversionLogic: '1000 Beans = 1 USD',
        publicRate: 0.001,
        internalRate: 0.0009,
        feeValue: 5,
        minimumWithdrawal: 10,
        maximumWithdrawal: 30000,
        etaText: '24-48 hours',
      },
      {
        appName: 'kiti',
        conversionUnitLabel: 'Points',
        conversionLogic: '500 Points = 1 USD',
        publicRate: 0.002,
        internalRate: 0.0018,
        feeValue: 4,
        minimumWithdrawal: 5,
        maximumWithdrawal: 5000,
        etaText: '12-24 hours',
      },
      {
        appName: 'xena',
        conversionUnitLabel: 'Coins',
        conversionLogic: '100 Coins = 1 USD',
        publicRate: 0.01,
        internalRate: 0.009,
        feeValue: 3,
        minimumWithdrawal: 1,
        maximumWithdrawal: 10000,
        etaText: 'Instant',
      },
    ];

    for (const rate of appRates) {
      try {
        await ratesService.createRate(rate);
        console.log(`✓ Created rate for: ${rate.appName}`);
      } catch (error) {
        console.log(`⚠ Rate already exists: ${rate.appName}`);
      }
    }

    // Create countries and payout methods
    console.log('🌍 Creating countries and payout methods...');

    const countries = [
      { name: 'Egypt', code: 'EG', currency: 'EGP' },
      { name: 'United Arab Emirates', code: 'AE', currency: 'AED' },
      { name: 'Saudi Arabia', code: 'SA', currency: 'SAR' },
      { name: 'Kuwait', code: 'KW', currency: 'KWD' },
      { name: 'Qatar', code: 'QA', currency: 'QAR' },
      { name: 'Bahrain', code: 'BH', currency: 'BHD' },
      { name: 'Oman', code: 'OM', currency: 'OMR' },
      { name: 'Jordan', code: 'JO', currency: 'JOD' },
      { name: 'Lebanon', code: 'LB', currency: 'LBP' },
      { name: 'Palestine', code: 'PS', currency: 'ILS' },
      { name: 'Iraq', code: 'IQ', currency: 'IQD' },
      { name: 'Morocco', code: 'MA', currency: 'MAD' },
      { name: 'Tunisia', code: 'TN', currency: 'TND' },
      { name: 'Algeria', code: 'DZ', currency: 'DZD' },
      { name: 'Sudan', code: 'SD', currency: 'SDG' },
      { name: 'Libya', code: 'LY', currency: 'LYD' },
      { name: 'Yemen', code: 'YE', currency: 'YER' },
      { name: 'Syria', code: 'SY', currency: 'SYP' },
    ];

    for (const country of countries) {
      try {
        const createdCountry = await countriesService.createCountry(country);

        // Add payout methods for each country
        const payoutMethods = [
          {
            name: 'Bank Transfer',
            feeType: FeeType.FIXED,
            feeValue: 2,
            etaText: '2-3 business days',
            recommended: false,
            sortOrder: 1,
          },
          {
            name: 'Mobile Wallet',
            feeType: FeeType.FIXED,
            feeValue: 1,
            etaText: 'Instant - 1 hour',
            recommended: true,
            sortOrder: 0,
          },
          {
            name: 'Cash Pickup',
            feeType: FeeType.PERCENTAGE,
            feeValue: 2.5,
            etaText: '30 minutes',
            recommended: false,
            sortOrder: 2,
          },
        ];

        for (const method of payoutMethods) {
          try {
            await countriesService.createPayoutMethod(country.code, method, 'system', 'System');
          } catch (error) {
            // Method might already exist
          }
        }

        console.log(`✓ Created country: ${country.name}`);
      } catch (error) {
        console.log(`⚠ Country already exists: ${country.name}`);
      }
    }

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
