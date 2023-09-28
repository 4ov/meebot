import "https://deno.land/std@0.203.0/dotenv/load.ts";
import { Bot, webhookCallback } from "npm:grammy";
import { Hono } from "npm:hono";

function env(key: string) {
  const value = Deno.env.get(key);
  if (value) return value;
  else {
    throw new Error(`Key ${key} required but not found`);
  }
}

const run_hash = "haha" + Math.random().toString(36).slice(0, 6);

const bot = new Bot(env("BOT_TOKEN"));
const app = new Hono();

const BOT_SECRET = env("BOT_SECRET");

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

const s = Deno.serve({
  port: 9000,
}, (req) => {
  if (req.url === "*") return new Response();
  const url = new URL(req.url);
  console.log(url.pathname);
  if (url.pathname === "/bot") {
    return webhookCallback(bot, "std/http", "return", 600, BOT_SECRET)(req);
  } else {
    return new Response("not found", {
      status: 404,
    });
  }
});