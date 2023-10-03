import "https://deno.land/std@0.203.0/dotenv/load.ts";
import { Bot, webhookCallback } from "npm:grammy";
import { Hono } from "npm:hono";
import { env } from "./lib/fns.ts";
import { z } from "npm:zod";
import type { ChatMember } from "npm:grammy/types";

const BOT_MODE = z.union([z.literal("WEBHOOK"), z.literal("POLL")]).parse(
  env("BOT_MODE"),
);

const run_hash = "rc1+" + Math.random().toString(36).slice(3, 9);

const bot = new Bot(env("BOT_TOKEN"));
const app = new Hono();

bot.on([":new_chat_members", ":left_chat_member"], async (ctx) => {
  //TODO: store it in a log
  await ctx.deleteMessage().catch((e) => {
    console.log(e);
  });
});

bot.command("info", (ctx) => {
  ctx.reply(
    `<pre><code>ASUBot
host version: ${Deno.version.deno}
hash: ${run_hash}
</code></pre>`,
    {
      parse_mode: "HTML",
      protect_content: true,
    },
  );
});

bot.on("::url", async (c, n) => {
  const sender = await bot.api.getChatMember(c.chat.id, c.from!.id);
  const ALLOWED: Partial<ChatMember>["status"][] = ["administrator", "creator"];
  if (
    !ALLOWED.includes(sender.status) &&
    (c.chat.type === "group" || c.chat.type === "supergroup")
  ) {
    //TODO: add to log
    await c.deleteMessage();
  } else {
    await n();
  }
});

if (BOT_MODE === "POLL") {
  console.log("waiting for updates");

  bot.start();
} else {
  const s = Deno.serve({
    port: 9000,
  }, (req) => {
    if (req.url === "*") return new Response();
    const url = new URL(req.url);
    console.log(url.pathname);
    if (url.pathname === "/bot") {
      return webhookCallback(bot, "std/http", "return", 600, env("BOT_SECRET"))(
        req,
      );
    } else {
      return new Response("not found", {
        status: 404,
      });
    }
  });
}
