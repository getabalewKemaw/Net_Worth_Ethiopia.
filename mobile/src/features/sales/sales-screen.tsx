import React from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { HamburgerHeader } from "@/components/navigation/hamburger-drawer";
import { useTheme } from "@/hooks/use-theme";
import { useSales } from "@/hooks/use-sales";
import { PaymentBadge } from "@/components/sales/payment-badge";
import { SaleTypeBadge } from "@/components/sales/sale-type-badge";
import { CategoryBadge } from "@/components/sales/category-badge";
import { SectionSummary } from "@/components/sales/section-summary";
import { AddSaleModal } from "@/features/sales/add-sale-modal";
import { AddExpenseModal } from "@/features/sales/add-expense-modal";

export function SalesScreen() {
  const colors = useTheme();
  const {
    activeTab,
    setActiveTab,
    sales,
    expenses,
    showAddSale,
    setShowAddSale,
    showAddExpense,
    setShowAddExpense,
    totalSales,
    totalExpenses,
    handleAddSale,
    handleAddExpense,
  } = useSales();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HamburgerHeader activeTabId="sales" />

      <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundElement }]}>
        <View style={[styles.togglePill, { backgroundColor: colors.background }]}>
          <Pressable style={[styles.toggleBtn, activeTab === "sales" && styles.toggleBtnActive]} onPress={() => setActiveTab("sales")}>
            {activeTab === "sales" && <View style={[styles.toggleBtnBg, { backgroundColor: "#065F46" }]} />}
            <ThemedText style={[styles.toggleBtnText, { color: activeTab === "sales" ? "#FFF" : colors.textSecondary }]}>
              🛒  Sales
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.toggleBtn, activeTab === "expenses" && styles.toggleBtnActive]} onPress={() => setActiveTab("expenses")}>
            {activeTab === "expenses" && <View style={[styles.toggleBtnBg, { backgroundColor: "#EF4444" }]} />}
            <ThemedText style={[styles.toggleBtnText, { color: activeTab === "expenses" ? "#FFF" : colors.textSecondary }]}>
              💸  Expenses
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {activeTab === "sales" ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
          <SectionSummary total={totalSales} count={sales.length} label="Sales" color="#065F46" />

          <Pressable style={styles.addBtn} onPress={() => setShowAddSale(true)}>
            <View style={styles.addBtnInner}>
              <View style={[styles.addIcon, { backgroundColor: "#065F46" }]}>
                <ThemedText style={{ fontSize: 20, color: "#FFF", fontWeight: "900", lineHeight: 24 }}>+</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 15, fontWeight: "800", color: "#065F46" }}>Record New Sale</ThemedText>
            </View>
          </Pressable>

          <ThemedText style={[styles.listHeader, { color: colors.textSecondary }]}>Today&apos;s Sales</ThemedText>

          {sales.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={{ fontSize: 36 }}>🛒</ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: "center" }}>
                No sales recorded today.{"\n"}Tap &quot;Record New Sale&quot; to get started.
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
                  <View style={[styles.cardIconBg, { backgroundColor: "#065F4618" }]}>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      <SaleTypeBadge saleType={sale.saleType} />
                      {sale.saleType === "instant" && <PaymentBadge method={sale.paymentMethod} />}
                      {sale.saleType === "dube" && sale.dueDate && (
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }}>
                          <ThemedText style={{ fontSize: 10, fontWeight: "800", color: "#92400E" }}>
                            📅 Due {sale.dueDate}
                          </ThemedText>
                        </View>
                      )}
                      <ThemedText style={[styles.cardTime, { color: colors.textSecondary }]}>{sale.time}</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={[styles.cardAmount, { color: "#065F46" }]}>
                  +{sale.amount.toLocaleString()}
                  {"\n"}
                  <ThemedText style={{ fontSize: 11, fontWeight: "500", color: colors.textSecondary }}>ETB</ThemedText>
                </ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
          <SectionSummary total={totalExpenses} count={expenses.length} label="Expenses" color="#EF4444" />

          <View style={[styles.netCard, { backgroundColor: totalSales >= totalExpenses ? "#ECFDF5" : "#FEF2F2", borderColor: totalSales >= totalExpenses ? "#A7F3D0" : "#FECACA" }]}>
            <View>
              <ThemedText style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.8 }}>Net Position Today</ThemedText>
              <ThemedText style={{ fontSize: 22, fontWeight: "900", color: totalSales >= totalExpenses ? "#065F46" : "#DC2626", marginTop: 2 }}>
                {totalSales >= totalExpenses ? "+" : ""}{(totalSales - totalExpenses).toLocaleString()} ETB
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 28 }}>{totalSales >= totalExpenses ? "📈" : "📉"}</ThemedText>
          </View>

          <Pressable style={[styles.addBtn, { borderColor: "#EF444440" }]} onPress={() => setShowAddExpense(true)}>
            <View style={styles.addBtnInner}>
              <View style={[styles.addIcon, { backgroundColor: "#EF4444" }]}>
                <ThemedText style={{ fontSize: 20, color: "#FFF", fontWeight: "900", lineHeight: 24 }}>+</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 15, fontWeight: "800", color: "#EF4444" }}>Log New Expense</ThemedText>
            </View>
          </Pressable>

          <ThemedText style={[styles.listHeader, { color: colors.textSecondary }]}>Today&apos;s Expenses</ThemedText>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={{ fontSize: 36 }}>💸</ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: "center" }}>
                No expenses logged today.{"\n"}Tap &quot;Log New Expense&quot; to track spending.
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
                  <View style={[styles.cardIconBg, { backgroundColor: "#EF444418" }]}>
                    <ThemedText style={{ fontSize: 18 }}>💸</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {expense.description}
                    </ThemedText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <CategoryBadge category={expense.category} />
                      <ThemedText style={[styles.cardTime, { color: colors.textSecondary }]}>{expense.time}</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={[styles.cardAmount, { color: "#EF4444" }]}>
                  -{expense.amount.toLocaleString()}
                  {"\n"}
                  <ThemedText style={{ fontSize: 11, fontWeight: "500", color: colors.textSecondary }}>ETB</ThemedText>
                </ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <AddSaleModal visible={showAddSale} onClose={() => setShowAddSale(false)} onAdd={handleAddSale} />
      <AddExpenseModal visible={showAddExpense} onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} />
    </SafeAreaView>
  );
}

export default SalesScreen;

const styles = StyleSheet.create({
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  togglePill: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },
  toggleBtnActive: {},
  toggleBtnBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 11,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: "800",
    zIndex: 1,
  },
  summaryCard: {
    marginTop: 14,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  netCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: "#065F4640",
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
  },
  addBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  addIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listHeader: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});
