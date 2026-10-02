import {
  MutationItemSchema,
  SyncPushRequestSchema,
  SyncPullQuerySchema,
} from "../types/sync";

async function runBackendSyncValidation() {
  console.log("=== [TEST 1] Zod Validation for Sync Push Payload ===");

  const validPushPayload = {
    businessId: "biz_123456",
    deviceId: "device_test_1",
    mutations: [
      {
        mutationId: "b89e2468-45b7-4b72-969f-d31e9cfa42ab",
        entityType: "sale",
        action: "CREATE",
        entityId: "sale_001",
        timestamp: new Date().toISOString(),
        payload: {
          id: "sale_001",
          branchId: "br_001",
          saleType: "instant",
          paymentMethod: "telebirr",
          description: "Test Coffee Sale",
          amount: 150,
          status: "settled",
        },
      },
      {
        mutationId: "c99e2468-45b7-4b72-969f-d31e9cfa42ac",
        entityType: "debt",
        action: "SETTLE",
        entityId: "debt_001",
        timestamp: new Date().toISOString(),
        payload: {
          paymentMethod: "cash",
          notes: "Paid in full at counter",
        },
      },
    ],
  };

  const parsedPush = SyncPushRequestSchema.safeParse(validPushPayload);
  if (!parsedPush.success) {
    console.error("FAIL: Push validation failed:", parsedPush.error.format());
    process.exit(1);
  }
  console.log("PASS: SyncPushRequestSchema parsed valid payload successfully.");

  console.log("\n=== [TEST 2] Zod Validation for Sync Pull Query ===");
  const validPullQuery = {
    businessId: "biz_123456",
    since: new Date(Date.now() - 3600 * 1000).toISOString(),
  };

  const parsedPull = SyncPullQuerySchema.safeParse(validPullQuery);
  if (!parsedPull.success) {
    console.error("FAIL: Pull validation failed:", parsedPull.error.format());
    process.exit(1);
  }
  console.log("PASS: SyncPullQuerySchema parsed valid query successfully.");

  console.log("\n=== [TEST 3] Invalid Payload Rejection ===");
  const invalidPushPayload = {
    businessId: "", // Empty businessId should fail
    mutations: [
      {
        mutationId: "", // Empty mutationId should fail
        entityType: "invalid_type",
        action: "CREATE",
        entityId: "123",
        payload: {},
      },
    ],
  };

  const parsedInvalid = SyncPushRequestSchema.safeParse(invalidPushPayload);
  if (parsedInvalid.success) {
    console.error("FAIL: Invalid push payload was unexpectedly accepted!");
    process.exit(1);
  }
  console.log("PASS: Invalid push payload was correctly rejected by schema validator.");

  console.log("\n=== [TEST 4] Mutation Item Schema Direct Check ===");
  const testMutation = {
    mutationId: "mut_test_uuid",
    entityType: "expense" as const,
    action: "CREATE" as const,
    entityId: "exp_999",
    payload: {
      description: "Electricity bill",
      amount: 1200,
      category: "Utilities",
    },
  };
  const parsedMutation = MutationItemSchema.safeParse(testMutation);
  if (!parsedMutation.success) {
    console.error("FAIL: Mutation item validation failed:", parsedMutation.error);
    process.exit(1);
  }
  console.log("PASS: Individual MutationItemSchema validated successfully.");

  console.log("\n==============================================");
  console.log("ALL BACKEND SYNC LOGIC TESTS PASSED SUCCESSFULLY!");
  console.log("==============================================");
}

runBackendSyncValidation().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
