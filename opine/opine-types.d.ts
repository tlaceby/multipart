import { MultipartFormData } from "https://deno.land/x/denjucks@1.1.1/src/deps/path/std/mime/multipart.ts";
// deno-lint-ignore no-unused-vars
import type { OpineRequest } from "https://deno.land/x/opine@2.2.0/mod.ts";

declare module "https://deno.land/x/opine@2.2.0/mod.ts" {
  interface OpineRequest {
    multipartData?: MultipartFormData;
  }
}
