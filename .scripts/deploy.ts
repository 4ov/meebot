import "https://deno.land/x/dzx@0.4.0/globals.ts";
import { readFile, writeFile } from "node:fs/promises"

const data = JSON.parse(await readFile("app.json", "utf-8"))

data.last_hash = Math.random().toString(36).slice(3, 9)

await writeFile("app.json", JSON.stringify(data))

await $`git add .`
await $`git commit -am ${Deno.args.join(" ")}`
// await $`git push origin main`