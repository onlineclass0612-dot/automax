/**
 * AutoMax Domain Pricing Engine
 * Single Source of Truth for pricing calculations, fee rules, and down payment logic.
 * Pure, deterministic functions usable across both Client UI and Server API.
 */

export const PRICING_CONSTANTS = {
  DEFAULT_DP_PERCENT: 30,
  DAILY_DRIVER_FEE: 150000,
} as const;

export interface PricingCalculationInput {
  dailyRate: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isWithDriver?: boolean;
  depositPercent?: number;
  paymentType: 'DOWN_PAYMENT' | 'FULL_PAYMENT';
}

export interface PricingBreakdownResult {
  durationDays: number;
  carSubtotal: number;
  driverSubtotal: number;
  driverFeePerDay: number;
  totalAmount: number;
  depositPercent: number;
  depositRequired: number;
  immediateAmountToPay: number;
  remainingAmount: number;
}

/**
 * Calculates rental days ensuring minimum 1 day and handling invalid inputs
 */
export function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(`${startDateStr}T09:00:00+07:00`);
  const end = new Date(`${endDateStr}T09:00:00+07:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 1;
  }

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Pure calculation of financial breakdown
 */
export function calculatePricingBreakdown(input: PricingCalculationInput): PricingBreakdownResult {
  const durationDays = calculateDurationDays(input.startDate, input.endDate);
  const driverFeePerDay = input.isWithDriver ? PRICING_CONSTANTS.DAILY_DRIVER_FEE : 0;
  const carSubtotal = input.dailyRate * durationDays;
  const driverSubtotal = driverFeePerDay * durationDays;
  const totalAmount = carSubtotal + driverSubtotal;

  const depositPercent = input.depositPercent ?? PRICING_CONSTANTS.DEFAULT_DP_PERCENT;
  const depositRequired = Math.round((totalAmount * depositPercent) / 100);

  const immediateAmountToPay =
    input.paymentType === 'DOWN_PAYMENT' ? depositRequired : totalAmount;
  const remainingAmount = totalAmount - immediateAmountToPay;

  return {
    durationDays,
    carSubtotal,
    driverSubtotal,
    driverFeePerDay,
    totalAmount,
    depositPercent,
    depositRequired,
    immediateAmountToPay,
    remainingAmount,
  };
}
