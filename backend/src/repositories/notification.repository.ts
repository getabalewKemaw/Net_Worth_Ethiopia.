import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../config/db";
import { notification, deviceToken } from "../db/schema";
import type { CreateNotificationInput, RegisterDeviceTokenInput } from "../types/notifications";

export const createIfAbsent = async (input: CreateNotificationInput) => {
  if (input.dedupeKey) {
    const [existing] = await db
      .select()
      .from(notification)
      .where(and(eq(notification.userId, input.userId), eq(notification.dedupeKey, input.dedupeKey)))
      .limit(1);
    if (existing) return { notification: existing, created: false };
  }
  const [row] = await db
    .insert(notification)
    .values({ id: crypto.randomUUID(), ...input })
    .returning();
  return { notification: row, created: true };
};

export const listByUser = async (userId: string, limit: number, unreadOnly = false) => {
  const conditions = [eq(notification.userId, userId)];
  if (unreadOnly) conditions.push(isNull(notification.readAt));
  return db
    .select()
    .from(notification)
    .where(and(...conditions))
    .orderBy(desc(notification.createdAt))
    .limit(limit);
};

export const countUnread = async (userId: string) => {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notification)
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  return Number(row?.count ?? 0);
};

export const markRead = async (userId: string, id: string) => {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, id), eq(notification.userId, userId)));
};

export const markAllRead = async (userId: string) => {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
};

export const upsertToken = async (userId: string, input: RegisterDeviceTokenInput) => {
  const [existing] = await db
    .select()
    .from(deviceToken)
    .where(eq(deviceToken.token, input.token))
    .limit(1);

  if (existing) {
    await db
      .update(deviceToken)
      .set({ userId, platform: input.platform, isActive: true, updatedAt: new Date() })
      .where(eq(deviceToken.token, input.token));
    return;
  }

  await db.insert(deviceToken).values({
    id: crypto.randomUUID(),
    userId,
    token: input.token,
    platform: input.platform,
    isActive: true,
  });
};

export const listActiveTokens = async (userId: string) => {
  return db
    .select()
    .from(deviceToken)
    .where(and(eq(deviceToken.userId, userId), eq(deviceToken.isActive, true)));
};
export const deactivateToken = async (userId: string, token: string) => {
  await db
    .update(deviceToken)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(deviceToken.userId, userId), eq(deviceToken.token, token)));
};
