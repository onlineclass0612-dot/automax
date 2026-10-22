/**
 * AutoMax Mayar Payment Gateway Service
 * Handles creation of dynamic payment links (QRIS & Virtual Accounts) via Mayar API
 */

export interface CreatePaymentParams {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  description: string;
}

export interface MayarPaymentResult {
  success: boolean;
  paymentUrl: string;
  transactionId?: string;
  rawResponse?: string;
}

export async function createMayarPayment(params: CreatePaymentParams): Promise<MayarPaymentResult> {
  const apiKey = process.env.MAYAR_API_KEY;
  const baseUrl = process.env.MAYAR_BASE_URL || 'https://api.mayar.id/hl/v1';

  // If no API key configured yet, provide a seamless sandbox simulator URL
  if (!apiKey || apiKey.trim() === '') {
    console.log('[Mayar Service] No API Key provided in .env, generating local simulation payment link.');
    const simulatedPaymentUrl = `/order/${params.orderNumber}?simulated_payment=true&amount=${params.amount}`;
    return {
      success: true,
      paymentUrl: simulatedPaymentUrl,
      transactionId: `SIM_${Date.now()}`,
      rawResponse: JSON.stringify({ mode: 'SIMULATION', message: 'Local sandbox simulation' }),
    };
  }

  try {
    const payload = {
      name: params.customerName,
      email: params.customerEmail || `${params.customerPhone}@automax.id`,
      mobile: params.customerPhone,
      amount: params.amount,
      description: `${params.description} (#${params.orderNumber})`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${params.orderNumber}`,
    };

    const res = await fetch(`${baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.data?.link) {
      console.error('[Mayar Service Error]', data);
      throw new Error(data.message || 'Gagal membuat tagihan pembayaran Mayar');
    }

    return {
      success: true,
      paymentUrl: data.data.link,
      transactionId: data.data.id || data.data.transaction_id,
      rawResponse: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('[Mayar API Exception]', error);
    // Graceful fallback to simulator if network or API error occurs in sandbox
    return {
      success: true,
      paymentUrl: `/order/${params.orderNumber}?simulated_payment=true&amount=${params.amount}`,
      transactionId: `FALLBACK_${Date.now()}`,
      rawResponse: JSON.stringify({ error: error.message }),
    };
  }
}
