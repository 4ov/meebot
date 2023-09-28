import { Db, MongoClient } from "npm:mongodb";
import { env } from "./fns.ts";

const c = new MongoClient(
  env("MONGO_URL"),
  {
    family: 4,
  },
);

let $client: null | Db = null;

export async function connect() {
  console.time("connect");
  if ($client) return $client;
  else {return c.connect().then((c) => c.db("main")).finally(() => {
      console.timeEnd("connect");
    });}
}
