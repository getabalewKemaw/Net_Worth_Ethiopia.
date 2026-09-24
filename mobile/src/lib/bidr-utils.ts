import { SEVEN_DAYS_MS } from '@/constants/bidr';
import type { DebtItem } from '@/types/bidr';

export interface DebtStatusDisplay {
  label: string;
  color: string;
  dotColor: string;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

export function getDebtStatusDisplay(debt: DebtItem): DebtStatusDisplay {
  if (debt.status === 'settled') {
    const paidDate = debt.paidAt
      ? new Date(debt.paidAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : 'Paid';
    return {
      label: `Settled on ${paidDate}`,
      color: '#065F46',
      dotColor: '#059669',
    };
  }

  if (debt.status === 'voided') {
    return {
      label: 'Voided credit',
      color: '#64748B',
      dotColor: '#94A3B8',
    };
  }

  if (!debt.dueDate) {
    return {
      label: 'No deadline set',
      color: '#64748B',
      dotColor: '#94A3B8',
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(debt.dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${absDays} ${absDays === 1 ? 'day' : 'days'}`,
      color: '#DC2626',
      dotColor: '#EF4444',
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      color: '#D97706',
      dotColor: '#F59E0B',
      isDueSoon: true,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      color: '#D97706',
      dotColor: '#F59E0B',
      isDueSoon: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Due in ${diffDays} days`,
      color: '#D97706',
      dotColor: '#F59E0B',
      isDueSoon: true,
    };
  }

  return {
    label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    color: '#065F46',
    dotColor: '#10B981',
  };
}

export function calculateDeadlineInsights(debts: DebtItem[]) {
  const now = new Date().getTime();
  let overdueCount = 0;
  let overdueTotal = 0;
  let dueWithinWeekCount = 0;
  let dueWithinWeekTotal = 0;

  for (const d of debts) {
    if (d.status === 'pending' && d.dueDate) {
      const dueTime = new Date(d.dueDate).getTime();
      if (dueTime < now) {
        overdueCount += 1;
        overdueTotal += d.amount;
      } else if (dueTime <= now + SEVEN_DAYS_MS) {
        dueWithinWeekCount += 1;
        dueWithinWeekTotal += d.amount;
      }
    }
  }

  return {
    overdueCount,
    overdueTotal,
    dueWithinWeekCount,
    dueWithinWeekTotal,
    hasAlerts: overdueCount > 0 || dueWithinWeekCount > 0,
  };
}
