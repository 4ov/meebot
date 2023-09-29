import "https://deno.land/std@0.203.0/dotenv/load.ts";
import { Bot, webhookCallback } from "npm:grammy";
import { Hono } from "npm:hono";
import { env } from "./lib/fns.ts";
import { z } from "npm:zod";

const BOT_MODE = z.union([z.literal("WEBHOOK"), z.literal("POLL")]).parse(
  env("BOT_MODE"),
);


const run_hash = "haha" + Math.random().toString(36).slice(0, 6);

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

if (BOT_MODE === "POLL") {
  console.log('waiting for updates');
  
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
