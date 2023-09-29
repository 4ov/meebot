export function env(key: string) {
    const value = Deno.env.get(key);
    if (value) return value;
    else {
      throw new Error(`Key ${key} required but not found`);
    }
  }
  