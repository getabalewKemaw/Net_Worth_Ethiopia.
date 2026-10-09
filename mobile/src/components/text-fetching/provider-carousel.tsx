import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTextFetchingStore } from '@/store/text-fetching-store';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ProviderCarousel() {
  const { providerSummaries } = useTextFetchingStore();

  const totalIn = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalDeposits, 0);
  const totalOut = Object.values(providerSummaries).reduce((sum, s) => sum + s.totalExpenses, 0);
  const totalTxnCount = Object.values(providerSummaries).reduce(
    (sum, s) => sum + s.depositCount + s.expenseCount,
    0
  );

  // If there are no transactions, do not show the summary card
  if (totalTxnCount === 0) {
    return null;
  }

  const netCashFlow = totalIn - totalOut;

  return (
    <View style={styles.container}>
      {/* Ethiopian Forest Emerald Hero Card */}
      <View style={styles.heroCard}>
        {/* Top Indicator & Label Row */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroHeaderLeft}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.heroHeaderLabel}>Net SMS Cash Flow</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{totalTxnCount} SMS Parsed</Text>
          </View>
        </View>

        {/* Main Net Balance Display */}
        <View style={styles.heroAmountRow}>
          <Text style={styles.heroAmountText}>
            {netCashFlow >= 0 ? '+' : ''}{formatMoney(netCashFlow)}
          </Text>
          <Text style={styles.heroCurrencyText}>ETB</Text>
        </View>

        {/* Bottom Split Row: Inflow (Green) & Outflow (Orange) */}
        <View style={styles.heroStatsDivider}>
          {/* Total Inflow */}
          <View style={styles.statColLeft}>
            <Text style={styles.statSubLabel}>Total Inflow</Text>
            <Text style={styles.statInflowValue}>
              +{formatMoney(totalIn)}{' '}
              <Text style={styles.statInflowUnit}>ETB</Text>
            </Text>
          </View>

          {/* Total Outflow (Orange - Brand Expense Color) */}
          <View style={styles.statColRight}>
            <Text style={styles.statSubLabel}>Total Outflow</Text>
            <Text style={styles.statOutflowValue}>
              -{formatMoney(totalOut)}{' '}
              <Text style={styles.statOutflowUnit}>ETB</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  heroCard: {
    backgroundColor: '#064E3B', // Brand emerald dark (from global.css --color-brand-dark)
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  heroHeaderLabel: {
    color: '#A7F3D0',
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  countBadgeText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '700',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  heroAmountText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroCurrencyText: {
    color: '#A7F3D0',
    fontSize: 12.5,
    fontWeight: '800',
  },
  heroStatsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  statColLeft: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
  },
  statColRight: {
    flex: 1,
    paddingLeft: 12,
  },
  statSubLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statInflowValue: {
    color: '#34D399', // Mint emerald for inflow
    fontSize: 13.5,
    fontWeight: '800',
  },
  statInflowUnit: {
    color: 'rgba(52, 211, 153, 0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
  statOutflowValue: {
    color: '#FCD34D', // Brand orange/expense-light for outflow
    fontSize: 13.5,
    fontWeight: '800',
  },
  statOutflowUnit: {
    color: 'rgba(252, 211, 77, 0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
});
