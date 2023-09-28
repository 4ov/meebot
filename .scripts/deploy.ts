import "https://deno.land/x/dzx@0.4.0/globals.ts";

const data = JSON.parse(await Deno.readTextFile("app.json"))

data.last_hash = Math.random().toString(36).slice(3, 9)

await Deno.writeTextFile("app.json", JSON.stringify(data))

await $`git add .`
await $`git commit -am ${Deno.args.join(" ")}`
await $`git push origin main`