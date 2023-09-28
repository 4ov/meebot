import { Context, NextFunction } from "npm:grammy";
import { FullContext } from "./types.ts";
import { retry } from "https://deno.land/std/async/mod.ts";
import { connect } from "./db.ts";
import { P, match } from "npm:ts-pattern"
import { MongoServerError } from "npm:mongodb";
export type Middleware = <T extends FullContext>(
  ctx: T,
  next: NextFunction,
) => Promise<unknown>;

export const userSayCommand: Middleware = async (c) => {
  const isAnon = c.from?.username === "GroupAnonymousBot";
  await c.reply(`user ${isAnon ? "ANON" : c.from?.first_name} says ${c.match}`);
};

export const translateCommand: Middleware = async (c) => {
  c.session.lastContextType = "translate";
  await c.reply(`Great, send me a message`);
};

export const subscribeCommand: Middleware = async (c) => {
  try {
    const client = await connect();
    const old_user = await client.collection("users").findOne({
      tgid: c.from?.id.toString(),
    });
    if (old_user) {
      c.reply(`Your'e already a user, thanks for being one!`);
    } else {
      await client.collection("subrequest").insertOne({
        tgid: c.from!.id.toString(),
        created: new Date(),
      });
      c.reply(`A request is being reviewed now, thanks for waiting`);
    }
  } catch (e) {
    match(e).with(P.instanceOf(MongoServerError), err=>{
      //TODO: better way
      if(err.code === 11000){
        c.reply(`you're already on the list, please wait`)
      }
    }).otherwise(e=>{
      throw e
    })
  }
};
