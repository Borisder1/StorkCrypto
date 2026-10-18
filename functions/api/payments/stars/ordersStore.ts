// Server-side In-Memory Store for Telegram Stars Orders & Subscriptions
// Strict P0-1 Audit Compliance: Idempotency, Charge ID tracking, Expiry validation

export interface StarsOrder {
  orderId: string;
  userId: string;
  planId: 'PRO' | 'WHALE';
  amount: number; // in Stars (XTR)
  currency: 'XTR';
  uniquePayload: string;
  expiry: string; // ISO 8601
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  telegramPaymentChargeId?: string;
  paidAt?: string;
}

export interface UserSubscription {
  userId: string;
  tier: 'BASIC' | 'PRO' | 'WHALE';
  isPro: boolean;
  activeUntil: string;
  lastOrderId?: string;
  lastChargeId?: string;
  updatedAt: string;
}

// Global state in runtime memory (persists across requests within the worker lifecycle)
const globalOrders = new Map<string, StarsOrder>();
const globalSubscriptions = new Map<string, UserSubscription>();
const processedCharges = new Set<string>();

export const OrdersStore = {
  createOrder(order: StarsOrder): StarsOrder {
    globalOrders.set(order.orderId, order);
    return order;
  },

  getOrder(orderId: string): StarsOrder | undefined {
    return globalOrders.get(orderId);
  },

  getOrderByPayload(payload: string): StarsOrder | undefined {
    for (const order of globalOrders.values()) {
      if (order.uniquePayload === payload) {
        return order;
      }
    }
    return undefined;
  },

  isChargeProcessed(chargeId: string): boolean {
    return processedCharges.has(chargeId);
  },

  markPaid(orderId: string, chargeId: string): { success: boolean; order?: StarsOrder; error?: string } {
    const order = globalOrders.get(orderId);
    if (!order) {
      return { success: false, error: 'ORDER_NOT_FOUND' };
    }

    if (processedCharges.has(chargeId)) {
      return { success: true, order, error: 'ALREADY_PROCESSED' };
    }

    if (new Date(order.expiry).getTime() < Date.now()) {
      order.status = 'FAILED';
      return { success: false, error: 'ORDER_EXPIRED' };
    }

    order.status = 'PAID';
    order.telegramPaymentChargeId = chargeId;
    order.paidAt = new Date().toISOString();
    processedCharges.add(chargeId);

    // 30 days subscription duration
    const activeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    globalSubscriptions.set(order.userId, {
      userId: order.userId,
      tier: order.planId,
      isPro: true,
      activeUntil,
      lastOrderId: order.orderId,
      lastChargeId: chargeId,
      updatedAt: new Date().toISOString()
    });

    return { success: true, order };
  },

  markStatus(orderId: string, status: 'CANCELLED' | 'FAILED'): StarsOrder | undefined {
    const order = globalOrders.get(orderId);
    if (order && order.status === 'PENDING') {
      order.status = status;
    }
    return order;
  },

  getUserSubscription(userId: string): UserSubscription {
    const sub = globalSubscriptions.get(userId);
    if (sub) {
      // Check if expired
      if (new Date(sub.activeUntil).getTime() > Date.now()) {
        return sub;
      }
    }
    return {
      userId,
      tier: 'BASIC',
      isPro: false,
      activeUntil: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // Lookup for support and audit
  lookupOrder(query: string): StarsOrder | undefined {
    return (
      globalOrders.get(query) ||
      Array.from(globalOrders.values()).find(
        (o) => o.telegramPaymentChargeId === query || o.uniquePayload === query
      )
    );
  }
};
