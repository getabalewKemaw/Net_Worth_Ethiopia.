import cron from "node-cron";
import { processOverdueDubeNotifications } from "./reminder.job";

export const startNotificationScheduler = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const { retryFailedNotifications } = await import("../service/notifications.service");
      const r = await retryFailedNotifications();
      if (r.length > 0) console.log(`[retry] processed ${r.length}`);
    } catch (err) {
      console.error("[retry] failed", err);
    }
  });

  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("[notification-scheduler] running");
      try {
        await processOverdueDubeNotifications();
      } catch (err) {
        console.error("[notification-scheduler] failed", err);
      }
    },
    { timezone: "Africa/Addis_Ababa" },
  );

  console.log("[notification-scheduler] scheduled for 09:00 Africa/Addis_Ababa");
};


