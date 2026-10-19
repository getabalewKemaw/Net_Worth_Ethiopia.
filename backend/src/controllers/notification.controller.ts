import type { Request, Response, NextFunction } from "express";
import * as service from "../service/notifications.service";
import { registerDeviceTokenSchema, listNotificationsSchema } from "../validations/notification.validation";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { limit, unreadOnly } = listNotificationsSchema.parse(req.query);
    const result = await service.list(userId, limit, unreadOnly);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await service.markRead(userId, String(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await service.markAllRead(userId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const registerDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const input = registerDeviceTokenSchema.parse(req.body);
    await service.registerDevice(userId, input);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
