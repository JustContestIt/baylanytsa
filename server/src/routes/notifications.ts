import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import prisma from "../prisma";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: { select: { id: true, username: true, displayName: true } },
        post: { select: { id: true, content: true } }
      }
    });

    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true }
    });

    const formatted = notifications.map((notification: (typeof notifications)[number]) => ({
      id: notification.id,
      type: notification.type,
      read: true,
      createdAt: notification.createdAt,
      actor: notification.actor,
      post: notification.post,
      message:
        notification.type === "LIKE"
          ? `${notification.actor.displayName ?? notification.actor.username} liked your post`
          : `${notification.actor.displayName ?? notification.actor.username} commented on your post`
    }));

    res.json({ notifications: formatted });
  })
);

export default router;
