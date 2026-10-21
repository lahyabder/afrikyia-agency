import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

// Env overrides for the E2E dev server so it never reaches real services.
// Next.js and Vite never overwrite a variable already set in process.env, so
// every service-related key declared in the example env file or referenced in
// source is replaced by a local or unreachable placeholder. Fails closed when
// there is neither an example file nor any source to inspect.
// Limitation: keys read through dynamic names (process.env[name]) are not detected.
const EXAMPLE_FILES = [".env.example", ".env.local.example", "env.example"];
const SENSITIVE = /(URL|URI|HOST|KEY|SECRET|TOKEN|PASSWORD|PASS|DSN|ID|EMAIL|PHONE|WEBHOOK|USER|HEADER)$/;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const SKIPPED_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "android", "ios"]);
const ENV_REFERENCE = /(?:process\.env|import\.meta\.env)(?:\.([A-Z_][A-Z0-9_]*)|\[["']([A-Z_][A-Z0-9_]*)["']\])/g;

function placeholder(key: string, appUrl: string): string {
  if (/SUPABASE_URL$/.test(key)) return "http://127.0.0.1:54321";
  if (/(APP|SITE|BASE_PATH)_URL$/.test(key) && key.startsWith("NEXT_PUBLIC_")) return appUrl;
  if (/(URL|URI|HOST|DSN|WEBHOOK)$/.test(key)) return "http://127.0.0.1:9";
  return "e2e-placeholder";
}

function exampleKeys(file: string): string[] {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=/)?.[1])
    .filter((key): key is string => Boolean(key));
}

/** Env keys referenced in project source, plus whether any source file was found. */
function referencedKeys(root: string): { keys: Set<string>; sawSource: boolean } {
  const keys = new Set<string>();
  let sawSource = false;
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !entry.name.startsWith("_LEGACY_") && !SKIPPED_DIRS.has(entry.name)) {
          walk(join(dir, entry.name));
        }
      } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
        sawSource = true;
        for (const match of readFileSync(join(dir, entry.name), "utf8").matchAll(ENV_REFERENCE)) {
          keys.add(match[1] ?? match[2]);
        }
      }
    }
  };
  walk(root);
  return { keys, sawSource };
}

export function isolatedEnv(appUrl: string, root = process.cwd()): Record<string, string> {
  if (process.env.E2E_ALLOW_REAL_ENV === "1") return {};
  const file = EXAMPLE_FILES.map((f) => join(root, f)).find((f) => existsSync(f));
  const { keys, sawSource } = referencedKeys(root);
  if (!file && !sawSource) {
    throw new Error(
      "E2E isolation: no .env.example and no source files found under " + root + ". " +
        "Set E2E_ALLOW_REAL_ENV=1 only after confirming the env is not production.",
    );
  }
  if (file) exampleKeys(file).forEach((key) => keys.add(key));
  const sensitive = [...keys].filter((key) => SENSITIVE.test(key)).sort();
  return Object.fromEntries(sensitive.map((key) => [key, placeholder(key, appUrl)]));
}
