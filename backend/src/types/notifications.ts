export type NotificationType = "dube_overdue" | "system_update";

export interface RegisterDeviceTokenInput {
  token: string;
  platform: "ios" | "android" | "web";
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  dedupeKey?: string;
}