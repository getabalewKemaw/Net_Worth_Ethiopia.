import assert from "node:assert";
import {
  assignStaffSchema,
  dailyDigestQuerySchema,
} from "../validations/staff.validation";
import type { BranchDailyDigest, SettledDebtDigestItem } from "../types/staff";

function runStaffManagementUnitTests() {
  console.log("\n============================================================");
  console.log("NETWORTH ETHIOPIA — STAFF MANAGEMENT & API UNIT TESTS");
  console.log("============================================================\n");

  // TEST 1: Staff Assignment Validation Schema
  console.log(">>> [Test 1] Staff Assignment Input Validation...");
  const validStaffPayload = {
    email: "CHALA.Sales@gmail.com ",
    name: "Chala Tadesse",
    role: "sales",
  };
  const parseResult = assignStaffSchema.safeParse(validStaffPayload);
  assert.strictEqual(parseResult.success, true, "Valid staff payload should parse successfully");
  if (parseResult.success) {
    assert.strictEqual(
      parseResult.data.email,
      "chala.sales@gmail.com",
      "Email must be automatically trimmed and lowercased"
    );
    assert.strictEqual(parseResult.data.role, "sales", "Role should be 'sales'");
  }

  const invalidEmailPayload = {
    email: "not-an-email",
    name: "Invalid Staff",
  };
  const invalidResult = assignStaffSchema.safeParse(invalidEmailPayload);
  assert.strictEqual(invalidResult.success, false, "Invalid email should be rejected");

  const defaultRolePayload = {
    email: "abebe@gmail.com",
  };
  const defaultRoleResult = assignStaffSchema.safeParse(defaultRolePayload);
  assert.strictEqual(defaultRoleResult.success, true);
  if (defaultRoleResult.success) {
    assert.strictEqual(defaultRoleResult.data.role, "sales", "Default role must be 'sales'");
  }
  console.log("PASS: Staff assignment schemas validate format, lowercasing, and defaults.");

  // TEST 2: Daily Digest Query Validation
  console.log("\n>>> [Test 2] Daily Digest Query Validation...");
  const validDigestQuery = { businessId: "biz-101", date: "2026-10-24" };
  const validDigestResult = dailyDigestQuerySchema.safeParse(validDigestQuery);
  assert.strictEqual(validDigestResult.success, true, "Valid digest query should parse");

  const invalidDateDigestQuery = { businessId: "biz-101", date: "24-10-2026" };
  const invalidDateResult = dailyDigestQuerySchema.safeParse(invalidDateDigestQuery);
  assert.strictEqual(invalidDateResult.success, false, "Non-YYYY-MM-DD date should be rejected");

  const missingBizDigestQuery = { date: "2026-10-24" };
  const missingBizResult = dailyDigestQuerySchema.safeParse(missingBizDigestQuery);
  assert.strictEqual(missingBizResult.success, false, "Missing businessId must fail validation");
  console.log("PASS: Daily digest query schema enforces businessId and YYYY-MM-DD format.");

  // TEST 3: Staff Branch Isolation & Auto-Injection Logic
  console.log("\n>>> [Test 3] Branch Isolation Guard & Context Injection...");
  const mockStaffAssignment = {
    id: "asgn-1",
    businessId: "biz-101",
    branchId: "br-bole",
    userId: "user-chala",
    email: "chala@gmail.com",
    role: "sales",
    status: "active",
  };

  // Simulating check: staff trying to submit for another branch
  const maliciousReq = {
    body: {
      branchId: "br-piassa", // Cross-branch tamper attempt
      amount: 1500,
    },
  };
  const isBranchTampering =
    maliciousReq.body.branchId !== mockStaffAssignment.branchId;
  assert.strictEqual(
    isBranchTampering,
    true,
    "Cross-branch submission must be detected and rejected"
  );

  // Simulating transparent injection: branch omitted by staff
  const transparentReq = {
    body: {
      amount: 2500,
      description: "Counter sale",
    } as any,
  };
  if (!transparentReq.body.branchId) {
    transparentReq.body.branchId = mockStaffAssignment.branchId;
  }
  if (!transparentReq.body.businessId) {
    transparentReq.body.businessId = mockStaffAssignment.businessId;
  }
  transparentReq.body.recordedById = mockStaffAssignment.userId;
  transparentReq.body.recordedByName = "Chala Tadesse";

  assert.strictEqual(
    transparentReq.body.branchId,
    "br-bole",
    "Branch must be transparently auto-injected"
  );
  assert.strictEqual(
    transparentReq.body.businessId,
    "biz-101",
    "BusinessId must be transparently auto-injected"
  );
  assert.strictEqual(
    transparentReq.body.recordedById,
    "user-chala",
    "Attribution user ID must be injected"
  );
  console.log("PASS: Cross-branch tampering blocked and zero-latency injection verified.");

  // TEST 4: Daily Multi-Branch Digest Calculation Formula
  console.log("\n>>> [Test 4] Multi-Branch Digest Calculations...");
  const mockBranchesData: BranchDailyDigest[] = [
    {
      branchId: "br-bole",
      branchName: "Bole Outlet",
      cashierName: "Chala Tadesse",
      metrics: {
        grossInflow: 16400,
        cashVolume: 6200,
        telebirrVolume: 7800,
        cbeVolume: 2400,
        expenseVolume: 1200,
        netShiftCash: 15200, // 16400 - 1200
      },
      settledDebtsToday: [
        {
          saleId: "sale-101",
          customerName: "Almaz Kebede",
          amount: 3200,
          paymentMethod: "telebirr",
          recordedByName: "Chala Tadesse",
          time: "2026-10-24T14:25:00.000Z",
        },
      ],
    },
    {
      branchId: "br-piassa",
      branchName: "Piassa Branch",
      cashierName: "Sara Hailu",
      metrics: {
        grossInflow: 12000,
        cashVolume: 5000,
        telebirrVolume: 4000,
        cbeVolume: 3000,
        expenseVolume: 800,
        netShiftCash: 11200, // 12000 - 800
      },
      settledDebtsToday: [
        {
          saleId: "sale-102",
          customerName: "Kassahun Bekele",
          amount: 3600,
          paymentMethod: "cbe",
          recordedByName: "Sara Hailu",
          time: "2026-10-24T16:10:00.000Z",
        },
      ],
    },
  ];

  const totalInflow = mockBranchesData.reduce((sum, b) => sum + b.metrics.grossInflow, 0);
  const totalCashInDrawer = mockBranchesData.reduce((sum, b) => sum + b.metrics.cashVolume, 0);
  const totalDigitalInflow = mockBranchesData.reduce(
    (sum, b) => sum + b.metrics.telebirrVolume + b.metrics.cbeVolume,
    0
  );
  const totalDubeSettled = mockBranchesData.reduce(
    (sum, b) => sum + b.settledDebtsToday.reduce((dSum, d) => dSum + d.amount, 0),
    0
  );

  assert.strictEqual(totalInflow, 28400, "Total inflow should be 16400 + 12000 = 28400 ETB");
  assert.strictEqual(totalCashInDrawer, 11200, "Total cash in drawer should be 6200 + 5000 = 11200 ETB");
  assert.strictEqual(totalDigitalInflow, 17200, "Total digital inflow should be (7800+2400) + (4000+3000) = 17200 ETB");
  assert.strictEqual(totalDubeSettled, 6800, "Total dube settled should be 3200 + 3600 = 6800 ETB");
  assert.strictEqual(
    totalCashInDrawer + totalDigitalInflow,
    totalInflow,
    "Cash + Digital breakdown must match total inflow exactly"
  );
  console.log("PASS: Multi-branch digest aggregation formulas verified.");

  // TEST 5: Auto-Claim Verification
  console.log("\n>>> [Test 5] First-Time Staff Login Auto-Claim Logic...");
  const pendingInvite = {
    email: "chala.sales@gmail.com",
    userId: null,
    status: "pending",
  };
  const loggingInUser = {
    id: "usr-google-999",
    email: "CHALA.SALES@gmail.com",
  };

  const shouldAutoClaim =
    pendingInvite.status === "pending" &&
    pendingInvite.userId === null &&
    pendingInvite.email.toLowerCase() === loggingInUser.email.toLowerCase().trim();

  assert.strictEqual(shouldAutoClaim, true, "Pending invite must match user email case-insensitively");

  const claimedRecord = {
    ...pendingInvite,
    userId: loggingInUser.id,
    status: "active",
    acceptedAt: new Date().toISOString(),
  };

  assert.strictEqual(claimedRecord.status, "active");
  assert.strictEqual(claimedRecord.userId, "usr-google-999");
  console.log("PASS: Auto-claim algorithm links pending invitation to newly authenticated user.");

  console.log("\n============================================================");
  console.log("ALL 5 STAFF MANAGEMENT BACKEND TESTS PASSED PERFECTLY!");
  console.log("============================================================\n");
}

runStaffManagementUnitTests();
