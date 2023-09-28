import "https://deno.land/std@0.203.0/dotenv/load.ts";
import { Bot, session, webhookCallback } from "npm:grammy";
import { Hono } from "npm:hono";
// import { delay } from "https://deno.land/std/async/mod.ts";
import type Client from "https://unpkg.com/@replit/database@2.0.5/index.d.ts";
import DBClient from "npm:@replit/database@2.0.5";
import { onlyAdmin } from "./lib/onlyadmins.ts";
import { subscribeCommand, translateCommand, userSayCommand } from "./lib/commands.ts";
import { FullContext, getInitialSession } from "./lib/types.ts";
import { env, translate } from "./lib/fns.ts";

const IS_DEV = Deno.env.get("MODE") === "DEV";

const bot = new Bot<FullContext>(env("BOT_TOKEN"));
const app = new Hono();
//@ts-ignore :)
const db = new DBClient() as Client;




bot.use(session({
  initial: getInitialSession
}));

async function setup() {
  await bot.api.setMyCommands([{
    command: "/mute",
    description: "mute someone",
  }], {
    scope: {
      type: "all_chat_administrators",
    },
  });

  console.log("setup successfull");
}

// await setup()

if (IS_DEV) {
  await bot.api.deleteWebhook();
} else {
  const webhook_set = await db.get("webhook_set");
  if (!webhook_set) {
    await bot.api.setWebhook(env("BOT_URL"), {
      secret_token: env("BOT_SECRET"),
    });
    await db.set("webhook_set", true);
  }
}

const report = async (e: unknown) => {
  console.log(e);
  Deno.writeTextFile("report.txt", `${e}\r\n---------\r\n`, {
    append: true,
    create: true,
  });
};

globalThis.addEventListener("unhandledrejection", (ev) => {
  // ev.preventDefault();
  ev.promise.catch(async (e) => {
    await report(e);
  });
});


const run_hash = Math.random().toString(36).slice(0, 6);

bot.on([":new_chat_members", ":left_chat_member"], async (ctx) => {
  //TODO: store it in a log
  await ctx.deleteMessage().catch((e) => {
    console.log(e);
  });
});



bot.on("message:text", async (c, n)=>{
  switch(c.session.lastContextType){
    case "translate":
        c.reply(await translate(c.msg.text, { to : "ar" }))
        c.session.lastContextType = "none"
      break;
    case "mute":
    case "none":
      await n();
  }
})

bot.command("say", userSayCommand);
bot.command("translate", translateCommand);
bot.command("subscribe", subscribeCommand);

bot.command("info", (ctx) => {
  ctx.reply(
    `<pre><code>ASUBot
host version: ${Deno.version.deno}
hash: ${run_hash}
mode: ${IS_DEV ? "dev" : "prod"}
</code></pre>`,
    {
      parse_mode: "HTML",
      protect_content: true,
    },
  );
});

bot
  .use(onlyAdmin(async (c) => {
    await c.deleteMessage();
  }))
  .command("mute", (c) => {
    console.log(c.msg.reply_to_message, c.entities());
  });

if (!IS_DEV) {
  const s = Deno.serve({
    port: 8000,
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
} else {
  console.log("bot started");
  bot.start();
}
