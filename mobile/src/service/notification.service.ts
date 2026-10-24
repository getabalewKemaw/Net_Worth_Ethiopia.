import { authClient, baseURL } from "@/lib/auth-client";

export interface RegisterDeviceInput {
  token: string;
  platform: "ios" | "android" | "web";
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  dedupeKey: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface ListNotificationsResponse {
  items: NotificationItem[];
  unread: number;
}

export const registerDeviceToken = async (input: RegisterDeviceInput) => {
  return authClient.$fetch(`${baseURL}/api/notifications/device-token`, {
    method: "POST",
    body: input,
  });
};

export const listNotifications = async (
  limit = 20,
  unreadOnly = false,
): Promise<ListNotificationsResponse> => {
  const res = await authClient.$fetch(
    `${baseURL}/api/notifications?limit=${limit}&unreadOnly=${unreadOnly}`,
    { method: "GET" },
  );
  return res as unknown as ListNotificationsResponse;
};

export const markNotificationRead = async (id: string) => {
  return authClient.$fetch(`${baseURL}/api/notifications/${id}/read`, {
    method: "PATCH",
  });
};

export const markAllNotificationsRead = async () => {
  return authClient.$fetch(`${baseURL}/api/notifications/read-all`, {
    method: "PATCH",
  });
};

export const deactivateDeviceToken = async (token: string) => {
  return authClient.$fetch(`${baseURL}/api/notifications/device-token/deactivate`, {
    method: "POST",
    body: { token },
  });
};

