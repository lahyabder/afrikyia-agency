import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { isolatedEnv } from "../../e2e/isolated-env";

const APP = "http://localhost:4613";

function projectWith(file: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "e2e-env-"));
  writeFileSync(join(dir, file), content);
  return dir;
}

describe("isolatedEnv", () => {
  afterEach(() => {
    delete process.env.E2E_ALLOW_REAL_ENV;
  });

  it("points Supabase at the local stack and replaces secrets with placeholders", () => {
    const dir = projectWith(
      ".env.example",
      "NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co\nPAYMENT_PROVIDER_KEY=\nMERCHANT_API_SECRET=\n",
    );
    expect(isolatedEnv(APP, dir)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      PAYMENT_PROVIDER_KEY: "e2e-placeholder",
      MERCHANT_API_SECRET: "e2e-placeholder",
    });
  });

  it("sends other service URLs to an unreachable address and the app URL to the test server", () => {
    const dir = projectWith("env.example", "MOON_API_BASE_URL=\nNEXT_PUBLIC_SITE_URL=\n");
    expect(isolatedEnv(APP, dir)).toEqual({
      MOON_API_BASE_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_SITE_URL: APP,
    });
  });

  it("keeps non-sensitive settings such as locale and currency", () => {
    const dir = projectWith(".env.example", "NEXT_PUBLIC_DEFAULT_LOCALE=ar\nNEXT_PUBLIC_CURRENCY=MRU\n");
    expect(isolatedEnv(APP, dir)).toEqual({});
  });

  it("overrides keys referenced in source when no example file exists", () => {
    const dir = projectWith("server.ts", 'const k = process.env.RESEND_API_KEY;\nconst u = import.meta.env.VITE_SUPABASE_URL;\nconst s = process.env["SMTP_PASS"];\nconst l = process.env.NEXT_PUBLIC_LOCALE;\n');
    expect(isolatedEnv(APP, dir)).toEqual({
      RESEND_API_KEY: "e2e-placeholder",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      SMTP_PASS: "e2e-placeholder",
    });
  });

  it("ignores node_modules and build output", () => {
    const dir = projectWith("app.ts", "process.env.APP_SECRET;\n");
    for (const folder of ["node_modules/pkg", ".next/server"]) {
      mkdirSync(join(dir, folder), { recursive: true });
      writeFileSync(join(dir, folder, "x.js"), "process.env.VENDOR_TOKEN;\n");
    }
    expect(isolatedEnv(APP, dir)).toEqual({ APP_SECRET: "e2e-placeholder" });
  });

  it("fails closed when neither an example env file nor any source file exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "e2e-env-"));
    expect(() => isolatedEnv(APP, dir)).toThrow(/E2E isolation/);
  });

  it("returns no overrides only with explicit opt-in", () => {
    process.env.E2E_ALLOW_REAL_ENV = "1";
    expect(isolatedEnv(APP, mkdtempSync(join(tmpdir(), "e2e-env-")))).toEqual({});
  });
});
