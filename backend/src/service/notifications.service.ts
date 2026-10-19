import { and, eq, lt } from "drizzle-orm";
import { db } from "../config/db";
import { business, sale } from "../db/schema";
import * as repo from "../repositories/notification.repository";
import { sendPushNotification } from "./push-sender";
import type { CreateNotificationInput, RegisterDeviceTokenInput } from "../types/notifications";

export const registerDevice = async (userId: string, input: RegisterDeviceTokenInput) => {
  return repo.upsertToken(userId, input);
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
  const overdue = await findOverdueDubes();
  const results = [];

  for (const dube of overdue) {
    const { notification, created } = await repo.createIfAbsent({
      userId: dube.userId,
      type: "dube_overdue",
      title: "Overdue Dube",
      body: `${dube.customerName ?? "Customer"}'s Dube is overdue.`,
      dedupeKey: `dube:${dube.saleId}:overdue`,
      data: { saleId: dube.saleId, route: "/dube" },
    });

    if (!created || !notification) continue;

    const tokens = await repo.listActiveTokens(dube.userId);
    for (const t of tokens) {
      await sendPushNotification({
        token: t.token,
        title: notification.title,
        body: notification.body,
        data: (notification.data as Record<string, unknown>) ?? {},
      });
    }

    results.push({ notification, created });
  }

  return results;
};
