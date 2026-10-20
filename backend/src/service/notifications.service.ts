import { and, eq, lt } from "drizzle-orm";
import { db } from "../config/db";
import { business, sale, notification as notificationTable } from "../db/schema";
import * as repo from "../repositories/notification.repository";
import { sendPushNotification } from "./push-sender";
import type { CreateNotificationInput, RegisterDeviceTokenInput } from "../types/notifications";

export const registerDevice = async (userId: string, input: RegisterDeviceTokenInput) => {
  return repo.upsertToken(userId, input);
};

export const deactivateDeviceToken = async (userId: string, token: string) => {
  await repo.deactivateToken(userId, token);
};

export const list = async (userId: string, limit = 20, unreadOnly = false) => {
  const items = await repo.listByUser(userId, limit, unreadOnly);
  const unread = await repo.countUnread(userId);
  return { items, unread };
};

export const markRead = async (userId: string, id: string) => repo.markRead(userId, id);
export const markAllRead = async (userId: string) => repo.markAllRead(userId);

export const createNotification = async (input: CreateNotificationInput) => {
  return repo.createIfAbsent(input);
};

export const createOverdueDubeNotification = async (
  userId: string,
  saleId: string,
  customerName: string | null,
) => {
  return repo.createIfAbsent({
    userId,
    type: "dube_overdue",
    title: "Overdue Dube",
    body: "You have an overdue Dube. Tap to view.",
    dedupeKey: `dube:${saleId}:overdue`,
    data: { route: "/dube", saleId, type: "dube_overdue" },
  });
};

export const findOverdueDubes = async () => {
  const today = new Date();
  return db
    .select({
      saleId: sale.id,
      userId: business.userId,
      customerName: sale.customerName,
    })
    .from(sale)
    .innerJoin(business, eq(sale.businessId, business.id))
    .where(
      and(
        eq(sale.saleType, "dube"),
        eq(sale.status, "pending"),
        lt(sale.dueDate, today),
      ),
    );
};

export const sendOverdueDubeNotifications = async () => {
  const overdueDubes = await findOverdueDubes();
  const createdForUser: Record<string, typeof overdueDubes> = {};

  for (const dube of overdueDubes) {
    const result = await createOverdueDubeNotification(
      dube.userId,
      dube.saleId,
      dube.customerName,
    );
    if (result.created) {
      const arr = createdForUser[dube.userId] ?? [];
      arr.push(dube);
      createdForUser[dube.userId] = arr;
    }
  }

  const results: unknown[] = [];
  for (const [userId, dubes] of Object.entries(createdForUser)) {
    if (dubes.length === 0) continue;
    const tokens = await repo.listActiveTokens(userId);

    const title =
      dubes.length === 1 ? "Overdue Dube" : `You have ${dubes.length} overdue Dubes`;
    const body =
      dubes.length === 1
        ? `${dubes[0]?.customerName ?? "Customer"}'s Dube is overdue.`
        : `Check your Dube list to follow up.`;

    for (const t of tokens) {
      const pushResult = await sendPushNotification({
        token: t.token,
        title,
        body,
        data: { route: "/dube", count: dubes.length, type: "dube_overdue_batch" },
      });
      results.push({ userId, pushResult });
    }
  }

  return {
    totalDubes: overdueDubes.length,
    usersNotified: Object.keys(createdForUser).length,
    results,
  };
};

export const retryFailedNotifications = async (maxAttempts = 3) => {
  const failed = await db
    .select()
    .from(notificationTable)
    .where(
      and(
        eq(notificationTable.deliveryStatus, "pending"),
        lt(notificationTable.deliveryAttempts, maxAttempts),
      ),
    )
    .limit(50);

  const results: unknown[] = [];
  for (const n of failed) {
    const tokens = await repo.listActiveTokens(n.userId);

    let anySuccess = false;
    for (const t of tokens) {
      const r = await sendPushNotification({
        token: t.token,
        title: n.title,
        body: n.body,
        data: (n.data as Record<string, unknown>) ?? {},
      });
      if (r.ok) anySuccess = true;
    }

    await db
      .update(notificationTable)
      .set({
        deliveryStatus: anySuccess ? "delivered" : "pending",
        deliveryAttempts: n.deliveryAttempts + 1,
        lastAttemptAt: new Date(),
      })
      .where(eq(notificationTable.id, n.id));

    results.push({ id: n.id, delivered: anySuccess });
  }
  return results;
};




