/// <reference types="./opine-types.d.ts" />
import { MultipartFormData } from "https://deno.land/x/denjucks@1.1.1/src/deps/path/std/mime/multipart.ts";

import {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "https://deno.land/x/opine@2.2.0/mod.ts";

export default function multipartFormParser() {
  return multipartParser;
}

import {
  MultipartReader,
} from "https://deno.land/x/denjucks@1.1.1/src/deps/path/std/mime/mod.ts";

export async function multipartParser(
  req: OpineRequest,
  _res: OpineResponse,
  next: NextFunction,
) {
  // Check the header for Content-Type
  if (req.headers.has("Content-Type") == false) {
    return next();
  }

  // Check for multipart header.
  if (
    (req.headers.get("Content-Type") as string).includes(
      "multipart/form-data",
    ) == false
  ) {
    return next();
  }

  const boundary = req.headers.get("Content-Type")?.split(";")[1].split(
    "=",
  )[1] as string;

  const form_data = await new MultipartReader(req.body, boundary).readForm();
  req.multipartData = form_data;
  return next();
}

export type MultipartData = MultipartFormData;
