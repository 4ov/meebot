import { retry } from "https://deno.land/std@0.203.0/async/retry.ts";

export function env(key: string) {
  const value = Deno.env.get(key);
  if (value) return value;
  else {
    throw new Error(`Key ${key} required but not found`);
  }
}

export async function translate(text: string, options: {
  from?: string;
  to: string;
}) {
  const url = new URL(env("TRANSLATE_API"));
  url.searchParams.set("text", text);
  url.searchParams.set("to", options.to);
  if (options.from) url.searchParams.set("from", options.from);
  try {
    const result = await retry(() => fetch(url));
    const _resp = result.clone();
    if (result.ok) {
      try {
        const json = await result.json();
        return json.result;
      } catch (e) {
        Deno.writeTextFile("x.html", await _resp.text());
      }
    } else {
      try {
        const json = await result.json();
        throw new Error(json.error);
      } catch (error) {
        throw error;
      }
    }
  } catch (e) {
    throw new Error("Network error");
  }
}
