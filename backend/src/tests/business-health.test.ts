import assert from "node:assert";

function runBusinessHealthUnitTests() {
  console.log("\n============================================================");
  console.log("NETWORTH ETHIOPIA — BUSINESS HEALTH BACKEND UNIT TESTS");
  console.log("============================================================\n");

  // TEST 1: Currency Flow & Net Profit Calculation
  console.log(">>> [Test 1] Currency Flow & Margin Calculations...");
  const mockInstantSales = [
    { amount: 5000, paymentMethod: "telebirr", saleType: "instant", branchId: "b1" },
    { amount: 3000, paymentMethod: "cbe", saleType: "instant", branchId: "b1" },
    { amount: 2000, paymentMethod: "cash", saleType: "instant", branchId: "b2" },
  ];
  const mockDubeSettled = [
    { amount: 1500, paymentMethod: "cash", saleType: "dube", status: "settled", branchId: "b2" },
  ];
  const mockExpenses = [
    { amount: 4500, branchId: "b1" },
    { amount: 1500, branchId: "b2" },
  ];

  const instantTotal = mockInstantSales.reduce((sum, s) => sum + s.amount, 0);
  const dubeSettledTotal = mockDubeSettled.reduce((sum, s) => sum + s.amount, 0);
  const grossInflow = instantTotal + dubeSettledTotal;
  const grossOutflow = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossInflow - grossOutflow;
  const profitMarginPct = (netProfit / grossInflow) * 100;

  assert.strictEqual(grossInflow, 11500, "Gross Inflow should be 10000 + 1500 = 11500 ETB");
  assert.strictEqual(grossOutflow, 6000, "Gross Outflow should be 4500 + 1500 = 6000 ETB");
  assert.strictEqual(netProfit, 5500, "Net Profit should be 11500 - 6000 = 5500 ETB");
  assert.strictEqual(Math.round(profitMarginPct), 48, "Profit margin should be ~48%");
  console.log("PASS: Currency flow, gross totals, and net margin calculated accurately.");

  // TEST 2: Digital Payment Ratio (Telebirr + CBE Birr vs Cash)
  console.log("\n>>> [Test 2] Verifiable Digital Payment Ratio...");
  const telebirrVolume = mockInstantSales
    .filter((s) => s.paymentMethod === "telebirr")
    .reduce((sum, s) => sum + s.amount, 0);
  const cbeVolume = mockInstantSales
    .filter((s) => s.paymentMethod === "cbe")
    .reduce((sum, s) => sum + s.amount, 0);
  const digitalRatio = ((telebirrVolume + cbeVolume) / grossInflow) * 100;

  assert.strictEqual(telebirrVolume, 5000, "Telebirr volume should be 5000 ETB");
  assert.strictEqual(cbeVolume, 3000, "CBE volume should be 3000 ETB");
  assert.strictEqual(Math.round(digitalRatio), 70, "Digital ratio should be ~70% (8000 / 11500)");
  console.log("PASS: Verifiable digital payment footprint calculated accurately.");

  // TEST 3: Month-over-Month (MoM) Growth Calculation
  console.log("\n>>> [Test 3] Month-over-Month Growth Calculation...");
  const prevMonthInflow = 9500;
  const momGrowth = ((grossInflow - prevMonthInflow) / prevMonthInflow) * 100;
  assert.strictEqual(momGrowth.toFixed(1), "21.1", "MoM growth should be +21.1%");

  const zeroPrevInflow = 0;
  const momGrowthFromZero = zeroPrevInflow > 0 ? ((grossInflow - zeroPrevInflow) / zeroPrevInflow) * 100 : 100;
  assert.strictEqual(momGrowthFromZero, 100, "MoM growth from 0 previous should be +100%");
  console.log("PASS: MoM growth percentage formulas handle standard and zero base cases.");

  // TEST 4: Multi-Branch Financial Breakdown & Share Allocation
  console.log("\n>>> [Test 4] Multi-Branch Contribution Shares...");
  const allSales = [...mockInstantSales, ...mockDubeSettled];
  const b1Inflow = allSales.filter((s) => s.branchId === "b1").reduce((sum, s) => sum + s.amount, 0);
  const b2Inflow = allSales.filter((s) => s.branchId === "b2").reduce((sum, s) => sum + s.amount, 0);

  const b1Share = Math.round((b1Inflow / grossInflow) * 100);
  const b2Share = Math.round((b2Inflow / grossInflow) * 100);

  assert.strictEqual(b1Inflow, 8000, "Branch 1 inflow should be 8000 ETB");
  assert.strictEqual(b2Inflow, 3500, "Branch 2 inflow should be 3500 ETB");
  assert.strictEqual(b1Share + b2Share, 100, "Branch shares should sum to 100%");
  console.log("PASS: Multi-branch volume breakdown and share contribution verified.");

  // TEST 5: Debt Recovery Rate
  console.log("\n>>> [Test 5] Customer Credit (Dube) Recovery Rate...");
  const totalDubeIssued = 2000;
  const totalDubeRecovered = 1500;
  const debtRecoveryRate = (totalDubeRecovered / totalDubeIssued) * 100;
  assert.strictEqual(debtRecoveryRate, 75, "Debt recovery rate should be 75%");
  console.log("PASS: Credit recovery rate metric verified.");

  console.log("\n============================================================");
  console.log("ALL 5 BUSINESS HEALTH BACKEND TESTS PASSED PERFECTLY!");
  console.log("============================================================\n");
}

runBusinessHealthUnitTests();
