import type { AppEnv } from "./types";

type Bindings = AppEnv["Bindings"];

declare module "cloudflare:test" {
  interface ProvidedEnv extends Bindings {}
}
