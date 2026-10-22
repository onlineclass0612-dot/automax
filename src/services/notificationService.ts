/**
 * AutoMax Notification Service
 * Architecture: Strategy Pattern & Dependency Inversion (SOLID OCP & DIP)
 * 
 * Allows plugging new channels (Telegram, WhatsApp, Email, Webhook)
 * without modifying the core notification orchestrator.
 */

export interface NotificationPayload {
  event: 'BOOKING_CREATED' | 'PAYMENT_DP_RECEIVED' | 'PAYMENT_FULL_RECEIVED' | 'BOOKING_COMPLETED' | 'BOOKING_CANCELLED';
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  orderUrl?: string;
}

/**
 * 1. Abstraction Contract (DIP)
 */
export interface NotificationChannel {
  readonly name: string;
  isEnabled(): boolean;
  send(payload: NotificationPayload): Promise<void>;
}

/**
 * 2. Telegram Bot Implementation Strategy
 */
export class TelegramNotificationChannel implements NotificationChannel {
  readonly name = 'Telegram';

  isEnabled(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID);
  }

  async send(payload: NotificationPayload): Promise<void> {
    try {
      const orderTrackingUrl = payload.orderUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${payload.orderNumber}`;
      const tgText =
        `🚗 *PESANAN BARU AUTOMAX! #${payload.orderNumber}*\n\n` +
        `👤 *Penyewa:* ${payload.customerName} (${payload.customerPhone})\n` +
        `🚘 *Mobil:* ${payload.carName}\n` +
        `📅 *Periode:* ${payload.startDate} - ${payload.endDate} (${payload.durationDays} Hari)\n` +
        `💰 *Total Biaya:* Rp ${payload.totalAmount.toLocaleString('id-ID')}\n` +
        `💳 *Terbayar:* Rp ${payload.paidAmount.toLocaleString('id-ID')}\n` +
        `⏳ *Sisa Tagihan:* Rp ${payload.remainingAmount.toLocaleString('id-ID')}\n` +
        `📌 *Status:* ${payload.status}\n\n` +
        `[Buka Tracking Web](${orderTrackingUrl})`;

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
          text: tgText,
          parse_mode: 'Markdown',
        }),
      });
      console.log(`[Notification:Telegram] Message sent for #${payload.orderNumber}`);
    } catch (err) {
      console.error(`[Notification:Telegram Error]`, err);
    }
  }
}

/**
 * 3. WhatsApp Direct URL Generator Strategy
 */
export class WhatsAppHelperChannel implements NotificationChannel {
  readonly name = 'WhatsAppHelper';

  isEnabled(): boolean {
    return true; // Always available to generate direct WhatsApp links
  }

  async send(payload: NotificationPayload): Promise<void> {
    const orderTrackingUrl = payload.orderUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${payload.orderNumber}`;
    const waText = encodeURIComponent(
      `Halo Kak ${payload.customerName}, terima kasih telah menyewa di AutoMax Car Rental.\n\n` +
      `Detail Pesanan #${payload.orderNumber}:\n` +
      `• Mobil: ${payload.carName}\n` +
      `• Durasi: ${payload.durationDays} Hari (${payload.startDate} s/d ${payload.endDate})\n` +
      `• Total Biaya: Rp ${payload.totalAmount.toLocaleString('id-ID')}\n` +
      `• Terbayar: Rp ${payload.paidAmount.toLocaleString('id-ID')}\n` +
      (payload.remainingAmount > 0 
        ? `• Sisa Pelunasan di Lokasi: Rp ${payload.remainingAmount.toLocaleString('id-ID')}\n\n` 
        : `• Status: LUNAS TOTAL\n\n`) +
      `Cek invoice & status pemesanan Anda: ${orderTrackingUrl}`
    );

    const waLink = `https://wa.me/${payload.customerPhone.replace(/^0/, '62')}?text=${waText}`;
    console.log(`[Notification:WhatsApp] Generated direct link for #${payload.orderNumber}: ${waLink.slice(0, 80)}...`);
  }
}

/**
 * 4. Extensible Channel Registry (OCP)
 * To add an email channel or SMS gateway in the future, simply push to this array!
 */
const channels: NotificationChannel[] = [
  new TelegramNotificationChannel(),
  new WhatsAppHelperChannel(),
];

export async function dispatchNotification(payload: NotificationPayload) {
  console.log(`[AutoMax Event] Dispatched: [${payload.event}] for Order #${payload.orderNumber}`);

  const activeChannels = channels.filter((c) => c.isEnabled());
  const results = await Promise.allSettled(activeChannels.map((c) => c.send(payload)));

  results.forEach((res, index) => {
    if (res.status === 'rejected') {
      console.error(`[Notification Channel ${activeChannels[index].name} Failed]`, res.reason);
    }
  });

  return { success: true };
}
