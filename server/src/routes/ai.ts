import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getEnv } from "../env";
import OpenAI from "openai";

const router = Router();

const bodySchema = z.object({
  topic: z.string().min(1).max(120)
});

let openaiClient: OpenAI | null = null;

const getClient = () => {
  if (!openaiClient) {
    const { OPENAI_API_KEY } = getEnv();
    if (!OPENAI_API_KEY) {
      return null;
    }
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openaiClient;
};

router.post(
  "/generate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { topic } = bodySchema.parse(req.body);
    const client = getClient();

    if (!client) {
      return res.json({
        idea: `Topic: ${topic}\nConsider sharing a quick update, a lesson learned, and a question for your followers.`
      });
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-3.5-turbo";

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content: "You create concise social media post ideas (2-3 sentences) with a friendly tone."
        },
        {
          role: "user",
          content: `Generate a short post idea about: ${topic}`
        }
      ]
    });

    const idea = completion.choices[0]?.message?.content?.trim();

    res.json({
      idea:
        idea ??
        `Topic: ${topic}\nShare why it matters to you, include one insight, and end with a question to spark discussion.`
    });
  })
);

export default router;
