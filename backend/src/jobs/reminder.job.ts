import { sendOverdueDubeNotifications } from "../service/notifications.service";

export const processOverdueDubeNotifications = async () => {
  return sendOverdueDubeNotifications();
};