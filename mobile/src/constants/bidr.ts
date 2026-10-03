import type { DebtFilterStatus, DebtSortOption } from '@/types/bidr';
import type { PaymentMethod } from '@/types/sales';

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const BIDR_FILTER_TABS: {
  key: DebtFilterStatus;
  label: string;
}[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due_soon', label: '1-Wk Due' },
  { key: 'settled', label: 'Settled' },
];

export const BIDR_SORT_OPTIONS: {
  key: DebtSortOption;
  label: string;
}[] = [
  { key: 'due_asc', label: 'Earliest Due Date' },
  { key: 'due_desc', label: 'Latest Due Date' },
  { key: 'amount_desc', label: 'Highest Amount' },
  { key: 'amount_asc', label: 'Lowest Amount' },
  { key: 'created_desc', label: 'Recently Created' },
  { key: 'created_asc', label: 'Oldest Created' },
];

export const BIDR_SETTLE_PAYMENT_METHODS: {
  key: PaymentMethod;
  name: string;
  sublabel: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    key: 'cash',
    name: 'Cash',
    sublabel: 'Physical cash received',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
  },
  {
    key: 'telebirr',
    name: 'Telebirr',
    sublabel: 'Mobile wallet transfer',
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9',
  },
  {
    key: 'cbe',
    name: 'CBE Birr',
    sublabel: 'Commercial Bank of Ethiopia',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
  },
];

export const BIDR_DUE_PRESETS = [
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];
