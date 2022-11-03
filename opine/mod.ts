import { MultipartReader } from "https://deno.land/x/denjucks@1.1.1/src/deps/path/std/mime/multipart.ts";

import {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "https://deno.land/x/opine@2.3.0/mod.ts";

import {
  DEFAULT_MAXIMUM_MEMORY,
  FormData,
  getBoundary,
  getFormFiles,
} from "../helpers.ts";

export * from "../helpers.ts";

/**
 * Optional configuration for multipart parsing middleware.
 */
export interface MultipartOptions {
  // Maximum memory to hold files before writing bytes to disk in temporary files.
  // Default value is 1048576 bytes - 1MB
  maxMemory?: number;

  // Specifies whether to populate req.body.files with array of uploaded files.
  // Defaults to false
  files?: boolean;

  // Provides some basic debugging.
  debug?: boolean;
}

/**
Middleware for Opine web framework providing easy access to multipart form data including files. */
export default function multipartFormParser(options?: MultipartOptions) {
  // Validate configuration
  options ??= {
    maxMemory: DEFAULT_MAXIMUM_MEMORY,
    debug: false,
    files: false,
  };

  options.maxMemory ??= DEFAULT_MAXIMUM_MEMORY;
  options.debug ??= false;
  options.files ??= false;

  // Return middleware
  return async (req: OpineRequest, _res: OpineResponse, next: NextFunction) => {
    // Validate proper content-type is passed into headers.
    const boundary = getBoundary(req.headers);
    if (!boundary) return next();

    // use maxMemory to specify the maximum allocated memory for parsing.
    const form_data = await new MultipartReader(req.body, boundary).readForm(
      options?.maxMemory,
    );

    const form: FormData = {
      fields: {},
      files: [],
      formData: form_data,
    };

    if(options?.files || options?.fields){
      const data = getFormData(form_data, { files: options?.files, fields: options?.fields });
      form.files = data[0] as FormFile[];
      form.fields = data[1] as Record<string, string>;

      // Log count of files added to req.body.files
      if (options.debug) {
        console.log(`Multipart::Files(%c${form.files.length})`, "color: cyan");
      }
    }

    req.body = form;
    return next();
  };
}
