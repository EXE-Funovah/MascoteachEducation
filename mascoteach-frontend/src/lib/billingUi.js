import { BILLING_PLAN_CODES } from '@/services/billingService';

export const billingStatusTone = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cancelled: 'border-slate-200 bg-slate-100 text-slate-600',
  Failed: 'border-rose-200 bg-rose-50 text-rose-700',
  Expired: 'border-zinc-200 bg-zinc-100 text-zinc-600',
};

export const billingStatusLabel = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã huỷ',
  Failed: 'Thất bại',
  Expired: 'Hết hạn',
};

export function formatBillingCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatBillingDate(value, options = {}) {
  const { includeTime = false, emptyLabel = 'Chưa có' } = options;
  if (!value) return emptyLabel;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;

  return new Intl.DateTimeFormat(
    'vi-VN',
    includeTime
      ? {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      : {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
  ).format(date);
}

export function getPlanCodeFromPlanId(planId) {
  return planId === 'yearly' ? BILLING_PLAN_CODES.yearly : BILLING_PLAN_CODES.monthly;
}

export function getPlanIdFromPlanCode(planCode) {
  return planCode === BILLING_PLAN_CODES.yearly ? 'yearly' : 'monthly';
}

export function getPlanLabel(planCode) {
  if (planCode === BILLING_PLAN_CODES.yearly) return 'Pro năm';
  if (planCode === BILLING_PLAN_CODES.monthly) return 'Pro tháng';
  return planCode || 'Không rõ';
}

export function getBillingStatusLabel(status) {
  return billingStatusLabel[status] || status || 'Không rõ';
}

export function isPremiumActive(source) {
  if (!source) return false;

  const explicitPremium = source.isPremiumActive ?? source.IsPremiumActive;
  if (typeof explicitPremium === 'boolean') {
    return explicitPremium;
  }

  const subscriptionTier = String(source.subscriptionTier ?? source.SubscriptionTier ?? '').trim().toLowerCase();
  if (subscriptionTier !== 'premium' && subscriptionTier !== 'pro') {
    return false;
  }

  const premiumExpiresAt = source.premiumExpiresAt ?? source.PremiumExpiresAt;
  if (!premiumExpiresAt) {
    return true;
  }

  const expiresAtMs = new Date(premiumExpiresAt).getTime();
  return Number.isNaN(expiresAtMs) ? true : expiresAtMs > Date.now();
}

function getCreatedAtTimestamp(order) {
  const createdAt = order?.createdAt ?? order?.CreatedAt;
  const timestamp = createdAt ? new Date(createdAt).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortOrdersByCreatedAtDesc(orders) {
  return [...(orders || [])].sort((left, right) => getCreatedAtTimestamp(right) - getCreatedAtTimestamp(left));
}

export function getPendingOrders(orders) {
  return sortOrdersByCreatedAtDesc(orders).filter((order) => order?.status === 'Pending');
}

export function getLatestPendingOrder(orders) {
  return getPendingOrders(orders)[0] ?? null;
}
