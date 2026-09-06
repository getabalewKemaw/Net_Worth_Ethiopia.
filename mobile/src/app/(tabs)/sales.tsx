import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HamburgerHeader } from '@/components/navigation/hamburger-drawer';
import { useTheme } from '@/hooks/use-theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaleType = 'instant' | 'dube';

type SaleEntry = {
  id: string;
  description: string;
  amount: number;
  customer?: string;
  phone?: string;
  paymentMethod: 'cash' | 'telebirr' | 'cbe';
  saleType: SaleType;
  time: string;
};

type ExpenseEntry = {
  id: string;
  description: string;
  amount: number;
  category: string;
  time: string;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_SALES: SaleEntry[] = [
  { id: 's1', description: 'Injera (10 plates)', amount: 350, customer: 'Abebe M.', paymentMethod: 'cash', saleType: 'instant', time: '09:15 AM' },
  { id: 's2', description: 'Wholesale flour 50kg', amount: 1200, customer: 'Tigist Shop', phone: '0912345678', paymentMethod: 'cash', saleType: 'dube', time: '10:42 AM' },
  { id: 's3', description: 'Mixed groceries', amount: 480, paymentMethod: 'cbe', saleType: 'instant', time: '11:30 AM' },
];

const INITIAL_EXPENSES: ExpenseEntry[] = [
  { id: 'e1', description: 'Electricity bill', amount: 750, category: 'Utilities', time: '08:00 AM' },
  { id: 'e2', description: 'Teff flour stock', amount: 2400, category: 'Inventory', time: '09:30 AM' },
  { id: 'e3', description: 'Driver salary', amount: 1800, category: 'Salary', time: '11:00 AM' },
];

const EXPENSE_CATEGORIES = ['Inventory', 'Utilities', 'Salary', 'Rent', 'Transport', 'Maintenance', 'Other'];
const PAYMENT_METHODS: { key: SaleEntry['paymentMethod']; label: string; name: string; icon: string; color: string }[] = [
  { key: 'cash', label: '💵 Cash', name: 'Cash', icon: '💵', color: '#10B981' },
  { key: 'telebirr', label: '📱 Telebirr', name: 'Telebirr', icon: '📱', color: '#7C3AED' },
  { key: 'cbe', label: '🏦 CBE Birr', name: 'CBE Birr', icon: '🏦', color: '#3B82F6' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function PaymentBadge({ method }: { method: SaleEntry['paymentMethod'] }) {
  const pm = PAYMENT_METHODS.find((p) => p.key === method)!;
  return (
    <View style={[styles.badge, { backgroundColor: pm.color + '18', borderColor: pm.color + '40' }]}>
      <ThemedText style={{ fontSize: 11, fontWeight: '700', color: pm.color }}>{pm.label}</ThemedText>
    </View>
  );
}

function SaleTypeBadge({ saleType }: { saleType: SaleType }) {
  const isDube = saleType === 'dube';
  return (
    <View style={[styles.badge, {
      backgroundColor: isDube ? '#FEF3C718' : '#F0FDF418',
      borderColor: isDube ? '#D9770640' : '#10B98140',
    }]}>
      <ThemedText style={{ fontSize: 11, fontWeight: '800', color: isDube ? '#D97706' : '#059669' }}>
        {isDube ? '📜 Dube' : '⚡ Instant'}
      </ThemedText>
    </View>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: '#F59E0B18', borderColor: '#F59E0B40' }]}>
      <ThemedText style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>{category}</ThemedText>
    </View>
  );
}

function SectionSummary({ total, count, label, color }: { total: number; count: number; label: string; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <ThemedText style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Today's {label}
      </ThemedText>
      <ThemedText style={{ fontSize: 26, fontWeight: '900', color, marginTop: 2 }}>
        {total.toLocaleString()} ETB
      </ThemedText>
      <ThemedText style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '500' }}>{count} {label.toLowerCase()}</ThemedText>
    </View>
  );
}

// ─── Add Sale Modal ────────────────────────────────────────────────────────────

function AddSaleModal({
  visible,
  onClose,
  onAdd,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<SaleEntry, 'id' | 'time'>) => void;
  colors: ReturnType<typeof useTheme>;
}) {
  const [saleType, setSaleType] = useState<SaleType>('instant');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<SaleEntry['paymentMethod']>('cash');

  const reset = () => {
    setSaleType('instant');
    setDesc('');
    setAmount('');
    setCustomer('');
    setPhone('');
    setMethod('cash');
  };

  const handleSubmit = () => {
    if (!desc.trim() || !amount.trim()) {
      Alert.alert('Missing Info', 'Please enter a description and amount.');
      return;
    }
    if (saleType === 'dube') {
      if (!customer.trim()) {
        Alert.alert('Missing Info', 'Customer name is required for Dube (debt) sales.');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Missing Info', 'Phone number is required for Dube (debt) sales.');
        return;
      }
    }
    onAdd({
      description: desc.trim(),
      amount: parseFloat(amount),
      customer: customer.trim() || undefined,
      phone: phone.trim() || undefined,
      paymentMethod: method,
      saleType,
    });
    reset();
    onClose();
  };

  const isDube = saleType === 'dube';
  const accentColor = isDube ? '#D97706' : '#10B981';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          {/* Handle bar */}
          <View style={styles.handleBar} />
          <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Record New Sale</ThemedText>

          {/* ── Sale Type Segmented Tab Switcher ─────────────── */}
          <View style={[styles.saleTypePill, { backgroundColor: colors.background }]}>
            <Pressable
              style={[styles.toggleBtn, !isDube && styles.toggleBtnActive]}
              onPress={() => setSaleType('instant')}
            >
              {!isDube && <View style={[styles.toggleBtnBg, { backgroundColor: '#10B981' }]} />}
              <ThemedText style={[styles.toggleBtnText, { color: !isDube ? '#FFF' : colors.textSecondary }]}>
                ⚡  Instant
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, isDube && styles.toggleBtnActive]}
              onPress={() => setSaleType('dube')}
            >
              {isDube && <View style={[styles.toggleBtnBg, { backgroundColor: '#D97706' }]} />}
              <ThemedText style={[styles.toggleBtnText, { color: isDube ? '#FFF' : colors.textSecondary }]}>
                📜  Dube (Debt)
              </ThemedText>
            </Pressable>
          </View>

          {/* ── Dube info note ─────────────────────────────── */}
          {isDube && (
            <View style={[styles.dubeNote, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
              <ThemedText style={{ fontSize: 12, color: '#92400E', fontWeight: '600', lineHeight: 18 }}>
                📜 Dube means the customer will pay later. Customer name and phone are required.
              </ThemedText>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <ThemedText style={styles.inputLabel}>Item / Description *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: '#E5E7EB' }]}
              placeholder="e.g. Injera 10 plates"
              placeholderTextColor={colors.textSecondary}
              value={desc}
              onChangeText={setDesc}
            />

            <ThemedText style={styles.inputLabel}>Amount (ETB) *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: '#E5E7EB' }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <ThemedText style={styles.inputLabel}>
              Customer Name{isDube ? ' *' : ' (optional)'}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: isDube && !customer.trim() ? '#FBBF24' : '#E5E7EB',
                },
              ]}
              placeholder={isDube ? 'Required for Dube sales' : 'Customer name (optional)'}
              placeholderTextColor={isDube ? '#D97706' : colors.textSecondary}
              value={customer}
              onChangeText={setCustomer}
            />

            {/* Phone — shown for both, required for Dube */}
            <ThemedText style={styles.inputLabel}>
              Phone Number{isDube ? ' *' : ' (optional)'}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: isDube && !phone.trim() ? '#FBBF24' : '#E5E7EB',
                },
              ]}
              placeholder={isDube ? 'Required — e.g. 0912345678' : 'e.g. 0912345678 (optional)'}
              placeholderTextColor={isDube ? '#D97706' : colors.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Payment method only for instant */}
            {!isDube && (
              <>
                <ThemedText style={styles.inputLabel}>Payment Method</ThemedText>
                <View style={styles.methodRow}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = method === pm.key;
                    return (
                      <Pressable
                        key={pm.key}
                        onPress={() => setMethod(pm.key)}
                        style={[
                          styles.methodBtn,
                          {
                            borderColor: isSelected ? pm.color : '#E5E7EB',
                            backgroundColor: isSelected ? pm.color + '18' : colors.background,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <ThemedText style={{ fontSize: 13 }}>{pm.icon}</ThemedText>
                          <ThemedText
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={{
                              fontSize: 12,
                              lineHeight: 16,
                              fontWeight: '700',
                              color: isSelected ? pm.color : colors.text,
                            }}
                          >
                            {pm.name}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <View style={[styles.modalActions, { marginTop: 8 }]}>
            <Pressable style={[styles.cancelBtn, { borderColor: '#E5E7EB' }]} onPress={() => { reset(); onClose(); }}>
              <ThemedText style={{ fontWeight: '700', color: '#6B7280' }}>Cancel</ThemedText>
            </Pressable>
            <Pressable style={[styles.submitBtn, { backgroundColor: accentColor }]} onPress={handleSubmit}>
              <ThemedText style={{ fontWeight: '800', color: '#FFF', fontSize: 15 }}>
                {isDube ? 'Record Dube' : 'Add Sale'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Add Expense Modal ─────────────────────────────────────────────────────────

function AddExpenseModal({
  visible,
  onClose,
  onAdd,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<ExpenseEntry, 'id' | 'time'>) => void;
  colors: ReturnType<typeof useTheme>;
}) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);

  const reset = () => { setDesc(''); setAmount(''); setCategory(EXPENSE_CATEGORIES[0]); };

  const handleSubmit = () => {
    if (!desc.trim() || !amount.trim()) {
      Alert.alert('Missing Info', 'Please enter a description and amount.');
      return;
    }
    onAdd({ description: desc.trim(), amount: parseFloat(amount), category });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />
          <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Log New Expense</ThemedText>

          <ThemedText style={styles.inputLabel}>Description *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: '#E5E7EB' }]}
            placeholder="e.g. Electricity bill"
            placeholderTextColor={colors.textSecondary}
            value={desc}
            onChangeText={setDesc}
          />

          <ThemedText style={styles.inputLabel}>Amount (ETB) *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: '#E5E7EB' }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <ThemedText style={styles.inputLabel}>Category</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.categoryRow}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    { borderColor: category === cat ? '#F59E0B' : '#E5E7EB', backgroundColor: category === cat ? '#FEF3C7' : colors.background },
                  ]}
                >
                  <ThemedText style={{ fontSize: 12, fontWeight: '700', color: category === cat ? '#D97706' : colors.textSecondary }}>
                    {cat}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={[styles.cancelBtn, { borderColor: '#E5E7EB' }]} onPress={() => { reset(); onClose(); }}>
              <ThemedText style={{ fontWeight: '700', color: '#6B7280' }}>Cancel</ThemedText>
            </Pressable>
            <Pressable style={[styles.submitBtn, { backgroundColor: '#EF4444' }]} onPress={handleSubmit}>
              <ThemedText style={{ fontWeight: '800', color: '#FFF', fontSize: 15 }}>Add Expense</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function SalesScreen() {
  const colors = useTheme();
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [sales, setSales] = useState<SaleEntry[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(INITIAL_EXPENSES);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalSales = sales.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAddSale = (entry: Omit<SaleEntry, 'id' | 'time'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setSales((prev) => [{ id: `s${Date.now()}`, time, ...entry }, ...prev]);
  };

  const handleAddExpense = (entry: Omit<ExpenseEntry, 'id' | 'time'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setExpenses((prev) => [{ id: `e${Date.now()}`, time, ...entry }, ...prev]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HamburgerHeader activeTabId="sales" />

      {/* ─── Toggle Switch ───────────────────────────────────── */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundElement }]}>
        <View style={[styles.togglePill, { backgroundColor: colors.background }]}>
          <Pressable
            style={[styles.toggleBtn, activeTab === 'sales' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('sales')}
          >
            {activeTab === 'sales' && <View style={[styles.toggleBtnBg, { backgroundColor: '#10B981' }]} />}
            <ThemedText style={[styles.toggleBtnText, { color: activeTab === 'sales' ? '#FFF' : colors.textSecondary }]}>
              🛒  Sales
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, activeTab === 'expenses' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('expenses')}
          >
            {activeTab === 'expenses' && <View style={[styles.toggleBtnBg, { backgroundColor: '#EF4444' }]} />}
            <ThemedText style={[styles.toggleBtnText, { color: activeTab === 'expenses' ? '#FFF' : colors.textSecondary }]}>
              💸  Expenses
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* ─── Content ─────────────────────────────────────────── */}
      {activeTab === 'sales' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <SectionSummary total={totalSales} count={sales.length} label="Sales" color="#10B981" />

          {/* Add Sale Button */}
          <Pressable
            style={styles.addBtn}
            onPress={() => setShowAddSale(true)}
          >
            <View style={styles.addBtnInner}>
              <View style={[styles.addIcon, { backgroundColor: '#10B981' }]}>
                <ThemedText style={{ fontSize: 20, color: '#FFF', fontWeight: '900', lineHeight: 24 }}>+</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>Record New Sale</ThemedText>
            </View>
          </Pressable>

          {/* Sales List */}
          <ThemedText style={[styles.listHeader, { color: colors.textSecondary }]}>Today's Sales</ThemedText>

          {sales.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={{ fontSize: 36 }}>🛒</ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                No sales recorded today.{'\n'}Tap "Record New Sale" to get started.
              </ThemedText>
            </View>
          ) : (
            sales.map((sale, i) => (
              <View
                key={sale.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundElement },
                  i === sales.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIconBg, { backgroundColor: '#10B98118' }]}>
                    <ThemedText style={{ fontSize: 18 }}>🛒</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {sale.description}
                    </ThemedText>
                    {sale.customer && (
                      <ThemedText style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        {sale.customer}
                      </ThemedText>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <SaleTypeBadge saleType={sale.saleType} />
                      {sale.saleType === 'instant' && <PaymentBadge method={sale.paymentMethod} />}
                      <ThemedText style={[styles.cardTime, { color: colors.textSecondary }]}>{sale.time}</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={[styles.cardAmount, { color: '#10B981' }]}>
                  +{sale.amount.toLocaleString()}
                  {'\n'}
                  <ThemedText style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }}>ETB</ThemedText>
                </ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <SectionSummary total={totalExpenses} count={expenses.length} label="Expenses" color="#EF4444" />

          {/* Net Position */}
          <View style={[styles.netCard, { backgroundColor: totalSales >= totalExpenses ? '#ECFDF5' : '#FEF2F2', borderColor: totalSales >= totalExpenses ? '#A7F3D0' : '#FECACA' }]}>
            <View>
              <ThemedText style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>Net Position Today</ThemedText>
              <ThemedText style={{ fontSize: 22, fontWeight: '900', color: totalSales >= totalExpenses ? '#059669' : '#DC2626', marginTop: 2 }}>
                {totalSales >= totalExpenses ? '+' : ''}{(totalSales - totalExpenses).toLocaleString()} ETB
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 28 }}>{totalSales >= totalExpenses ? '📈' : '📉'}</ThemedText>
          </View>

          {/* Add Expense Button */}
          <Pressable
            style={[styles.addBtn, { borderColor: '#EF444440' }]}
            onPress={() => setShowAddExpense(true)}
          >
            <View style={styles.addBtnInner}>
              <View style={[styles.addIcon, { backgroundColor: '#EF4444' }]}>
                <ThemedText style={{ fontSize: 20, color: '#FFF', fontWeight: '900', lineHeight: 24 }}>+</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 15, fontWeight: '800', color: '#EF4444' }}>Log New Expense</ThemedText>
            </View>
          </Pressable>

          {/* Expenses List */}
          <ThemedText style={[styles.listHeader, { color: colors.textSecondary }]}>Today's Expenses</ThemedText>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={{ fontSize: 36 }}>💸</ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                No expenses logged today.{'\n'}Tap "Log New Expense" to track spending.
              </ThemedText>
            </View>
          ) : (
            expenses.map((expense, i) => (
              <View
                key={expense.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundElement },
                  i === expenses.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIconBg, { backgroundColor: '#EF444418' }]}>
                    <ThemedText style={{ fontSize: 18 }}>💸</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {expense.description}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <CategoryBadge category={expense.category} />
                      <ThemedText style={[styles.cardTime, { color: colors.textSecondary }]}>{expense.time}</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={[styles.cardAmount, { color: '#EF4444' }]}>
                  -{expense.amount.toLocaleString()}
                  {'\n'}
                  <ThemedText style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }}>ETB</ThemedText>
                </ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ─── Modals ───────────────────────────────────────────── */}
      <AddSaleModal visible={showAddSale} onClose={() => setShowAddSale(false)} onAdd={handleAddSale} colors={colors} />
      <AddExpenseModal visible={showAddExpense} onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} colors={colors} />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Toggle ──────────────────────────────────────────
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  togglePill: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    overflow: 'hidden',
    position: 'relative',
  },
  toggleBtnActive: {},
  toggleBtnBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 11,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    zIndex: 1,
  },
  saleTypePill: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // ── Summary Card ────────────────────────────────────
  summaryCard: {
    marginTop: 14,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── Net Card ────────────────────────────────────────
  netCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },

  // ── Add Button ──────────────────────────────────────
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#10B98140',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#FAFAFA',
  },
  addBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  addIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── List ────────────────────────────────────────────
  listHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },

  // ── Empty State ─────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  // ── Modal ───────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  dubeNote: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
