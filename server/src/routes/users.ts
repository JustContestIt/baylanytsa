import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import prisma from "../prisma";
import { signToken } from "../utils/jwt";
import { getEnv } from "../env";
import { requireAuth } from "../middleware/auth";
import { BadRequestError, NotFoundError } from "../utils/errors";

const router = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters and underscore are allowed"),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional()
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { username, displayName, bio } = registerSchema.parse(req.body);
    const normalized = username.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username: normalized } });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName: displayName ?? existing.displayName,
          bio: bio ?? existing.bio
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          username: normalized,
          displayName: displayName ?? username,
          bio
        }
      });
    }

    const token = signToken(user.id);
    const { NODE_ENV } = getEnv();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  })
);

router.post(
  "/:id/follow",
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    if (targetId === req.user!.id) {
      throw new BadRequestError("Cannot follow yourself");
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      throw new NotFoundError("User not found");
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.follow.findFirst({
        where: {
          followerId: req.user!.id,
          followingId: targetId
        }
      });

      let following = true;
      if (existing) {
        await tx.follow.delete({ where: { id: existing.id } });
        following = false;
      } else {
        await tx.follow.create({
          data: {
            followerId: req.user!.id,
            followingId: targetId
          }
        });
      }

      const [followers, followingCount] = await Promise.all([
        tx.follow.count({ where: { followingId: targetId } }),
        tx.follow.count({ where: { followerId: req.user!.id } })
      ]);

      return { following, followers, followingCount };
    });

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let following = false;
    if (req.user) {
      const relation = await prisma.follow.findFirst({
        where: {
          followerId: req.user.id,
          followingId: user.id
        }
      });
      following = Boolean(relation);
    }

    res.json({ user: { ...user, following } });
  })
);

export default router;
