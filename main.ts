import { Bot, webhookCallback } from "npm:grammy"
import { Hono } from "npm:hono"

function env(key: string){
  const value = Deno.env.get(key)
  if(value)return value
  else{
    throw new Error(`Key ${key} required but not found`)
  }
}


const bot = new Bot(env("BOT_TOKEN"))
const app = new Hono()

bot.on([":new_chat_members", ":left_chat_member"], async ctx=>{
  //TODO: store it in a log
  await ctx.deleteMessage().catch(e=>{
    console.log(e);
  })
})


bot.command("info", ctx=>{
  ctx.reply(`<pre><code>ASUBot
host version: ${Deno.version.deno}
</code></pre>`, {
  parse_mode: "HTML",
  protect_content: true
})
})



app.use("/_bot", webhookCallback(bot, "hono"))


Deno.serve(app.fetch)