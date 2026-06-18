import api from './api';

export const BILLING_PLAN_CODES = {
    monthly: 'PRO_MONTHLY',
    yearly: 'PRO_YEARLY',
};

export const BILLING_PLAN_FALLBACKS = {
    PRO_MONTHLY: {
        planCode: 'PRO_MONTHLY',
        displayName: 'Pro Monthly',
        amount: 119000,
        currency: 'VND',
        durationDays: 30,
    },
    PRO_YEARLY: {
        planCode: 'PRO_YEARLY',
        displayName: 'Pro Yearly',
        amount: 1188000,
        currency: 'VND',
        durationDays: 365,
    },
};

export function normalizePlan(rawPlan) {
    if (!rawPlan) return null;

    return {
        planCode: rawPlan.planCode ?? rawPlan.PlanCode,
        displayName: rawPlan.displayName ?? rawPlan.DisplayName,
        amount: rawPlan.amount ?? rawPlan.Amount,
        currency: rawPlan.currency ?? rawPlan.Currency ?? 'VND',
        durationDays: rawPlan.durationDays ?? rawPlan.DurationDays,
    };
}

export function normalizeBillingStatus(rawStatus) {
    if (!rawStatus) return null;

    return {
        subscriptionTier: rawStatus.subscriptionTier ?? rawStatus.SubscriptionTier,
        isPremiumActive: rawStatus.isPremiumActive ?? rawStatus.IsPremiumActive ?? false,
        premiumExpiresAt: rawStatus.premiumExpiresAt ?? rawStatus.PremiumExpiresAt ?? null,
        daysRemaining: rawStatus.daysRemaining ?? rawStatus.DaysRemaining ?? 0,
    };
}

export function normalizePaymentOrder(rawOrder) {
    if (!rawOrder) return null;

    return {
        id: rawOrder.id ?? rawOrder.Id,
        orderCode: rawOrder.orderCode ?? rawOrder.OrderCode,
        planCode: rawOrder.planCode ?? rawOrder.PlanCode,
        amount: rawOrder.amount ?? rawOrder.Amount,
        currency: rawOrder.currency ?? rawOrder.Currency ?? 'VND',
        status: rawOrder.status ?? rawOrder.Status,
        provider: rawOrder.provider ?? rawOrder.Provider,
        checkoutUrl: rawOrder.checkoutUrl ?? rawOrder.CheckoutUrl,
        paidAt: rawOrder.paidAt ?? rawOrder.PaidAt ?? null,
        createdAt: rawOrder.createdAt ?? rawOrder.CreatedAt ?? null,
    };
}

export async function getBillingPlans() {
    const plans = await api.get('/api/Billing/plans');
    return Array.isArray(plans) ? plans.map(normalizePlan).filter(Boolean) : [];
}

export async function createPaymentLink(planCode) {
    return api.post('/api/Billing/create-payment-link', { planCode });
}

export async function getMyBilling() {
    const status = await api.get('/api/Billing/me');
    return normalizeBillingStatus(status);
}

export async function getMyBillingOrders() {
    const orders = await api.get('/api/Billing/orders/me');
    return Array.isArray(orders) ? orders.map(normalizePaymentOrder).filter(Boolean) : [];
}

export async function cancelPaymentOrder(orderCode) {
    return api.patch(`/api/Billing/orders/${orderCode}/cancel`);
}
