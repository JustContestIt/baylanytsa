import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import prisma from "../prisma";
import { NotFoundError } from "../utils/errors";
import { pushNotification } from "../sockets/notifications";

const router = Router();

const createPostSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(500)
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { content } = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.user!.id
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true }
        },
        _count: {
          select: { likes: true, comments: true }
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            author: { select: { id: true, username: true, displayName: true } }
          }
        }
      }
    });

    res.status(201).json({
      post: {
        ...post,
        likedByMe: false
      }
    });
  })
);

const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  authorId: z.string().optional()
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, cursor, limit, authorId } = listQuerySchema.parse(req.query);

    const where = {
      AND: [
        q
          ? {
              content: {
                contains: q,
                mode: "insensitive"
              }
            }
          : undefined,
        authorId ? { authorId } : undefined
      ].filter(Boolean) as object[]
    };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: {
          select: { id: true, username: true, displayName: true }
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            author: { select: { id: true, username: true, displayName: true } }
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    type PostWithExtras = (typeof posts)[number];

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const next = posts.pop();
      nextCursor = next?.id ?? null;
    }

    let likedPostIds = new Set<string>();
    if (req.user && posts.length) {
      const likes = await prisma.like.findMany({
        where: {
          userId: req.user.id,
          postId: { in: posts.map((post: PostWithExtras) => post.id) }
        },
        select: { postId: true }
      });
      likedPostIds = new Set(likes.map((like: (typeof likes)[number]) => like.postId));
    }

    const data = posts.map((post: PostWithExtras) => ({
      ...post,
      likedByMe: req.user ? likedPostIds.has(post.id) : false
    }));

    res.json({ posts: data, nextCursor });
  })
);

router.post(
  "/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true } }
      }
    });

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existing = await prisma.like.findFirst({
      where: {
        userId: req.user!.id,
        postId: post.id
      }
    });

    let liked = true;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({
        data: {
          userId: req.user!.id,
          postId: post.id
        }
      });

      if (post.authorId !== req.user!.id) {
        const actor = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { id: true, displayName: true, username: true }
        });

        if (actor) {
          const notification = await prisma.notification.create({
            data: {
              userId: post.authorId,
              actorId: actor.id,
              postId: post.id,
              type: "LIKE"
            }
          });

          pushNotification(post.authorId, {
            id: notification.id,
            type: notification.type,
            message: `${actor.displayName ?? actor.username} liked your post`,
            createdAt: notification.createdAt.toISOString(),
            read: notification.read,
            actor: {
              id: actor.id,
              username: actor.username,
              displayName: actor.displayName ?? null
            },
            postId: post.id
          });
        }
      }
    }

    const counts = await prisma.post.findUnique({
      where: { id: post.id },
      select: {
        _count: {
          select: { likes: true }
        }
      }
    });

    res.json({ liked, likeCount: counts?._count.likes ?? 0 });
  })
);

const commentSchema = z.object({
  content: z.string().min(1).max(300)
});

router.post(
  "/:id/comments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { content } = commentSchema.parse(req.body);

    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true } } }
    });

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user!.id,
        postId: post.id
      },
      include: {
        author: { select: { id: true, username: true, displayName: true } }
      }
    });

    if (post.authorId !== req.user!.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: comment.author.id,
          postId: post.id,
          type: "COMMENT"
        }
      });

      pushNotification(post.authorId, {
        id: notification.id,
        type: notification.type,
        message: `${comment.author.displayName ?? comment.author.username} commented on your post`,
        createdAt: notification.createdAt.toISOString(),
        read: notification.read,
        actor: {
          id: comment.author.id,
          username: comment.author.username,
          displayName: comment.author.displayName ?? null
        },
        postId: post.id
      });
    }

    const commentCount = await prisma.comment.count({ where: { postId: post.id } });

    res.status(201).json({
      comment,
      commentCount
    });
  })
);

export default router;
