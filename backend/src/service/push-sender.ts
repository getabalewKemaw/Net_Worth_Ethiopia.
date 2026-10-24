import { Expo } from "expo-server-sdk";

const expo = new Expo();

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const sendPushNotification = async (msg: PushMessage) => {
  console.log(`[push] attempting send to ${msg.token}`);
  console.log(`[push] title="${msg.title}" body="${msg.body}"`);

  if (!Expo.isExpoPushToken(msg.token)) {
    console.warn(`[push] INVALID token: ${msg.token}`);
    return { ok: false, reason: "invalid_token" };
  }

  const ticket = {
    to: msg.token,
    sound: "default" as const,
    title: msg.title,
    body: msg.body,
    ...(msg.data ? { data: msg.data } : {}),
  };

  console.log(`[push] ticket:`, JSON.stringify(ticket));

  try {
    const chunks = expo.chunkPushNotifications([ticket]);
    const responses = await Promise.all(
      chunks.map((c) => expo.sendPushNotificationsAsync(c)),
    );
    const flat = responses.flat();
    console.log(`[push] response:`, JSON.stringify(flat, null, 2));
    return { ok: true, responses: flat };
  } catch (err) {
    console.error(`[push] send failed`, err);
    return { ok: false, error: err };
  }
};
export const checkPushReceipts = async (ticketIds: string[]) => {
  if (ticketIds.length === 0) return [];
  try {
    const chunks = expo.chunkPushNotificationReceiptIds(ticketIds);
    const allReceipts = [];
    for (const chunk of chunks) {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      allReceipts.push(receipts);
    }
    return allReceipts;
  } catch (err) {
    console.error("[push] receipt check failed", err);
    return [];
  }
};
