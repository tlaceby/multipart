import { MultipartReader } from "https://deno.land/x/denjucks@1.1.1/src/deps/path/std/mime/multipart.ts";

import {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "https://deno.land/x/opine@2.0.0/mod.ts";

declare module "https://deno.land/x/opine@2.0.0/mod.ts" {
  interface OpineRequest {
    multipartData?: MultipartFormData;
    multipartFiles?: FormFile[];
  }
}

const DEFAULT_MAXIMUM_MEMORY = 1048576;

export interface MultipartFormData {
  file(key: string): FormFile | undefined;
  value(key: string): string | undefined;
  entries(): IterableIterator<[string, string | FormFile | undefined]>;
  [Symbol.iterator](): IterableIterator<
    [string, string | FormFile | undefined]
  >;
  /** Remove all tempfiles */
  removeAll(): Promise<void>;
}

export interface FormFile {
  /** filename  */
  filename: string;
  /** content-type header value of file */
  type: string;
  /** byte size of file */
  size: number;
  /** in-memory content of file. Either content or tempfile is set  */
  content?: Uint8Array;
  /** temporal file path.
   * Set if file size is bigger than specified max-memory size at reading form
   */
  tempfile?: string;
}

/**
 * Optional configuration for multipart parsing middleware.
 */
export interface MultipartOptions {
  // Maximum memory to hold files before writing bytes to disk in temporary files.
  // Default value is 1048576 bytes - 1MB
  maxMemory?: number;

  // Define whether to populate req.multipartFiles with FormFile[]
  // Default value is false.
  files?: boolean;

  // Whether to discard other formdata and populate the req.files field ONLY.\
  // Default value is false.
  filesOnly?: boolean;
}

export default function multipartFormParser(options?: MultipartOptions) {
  // Validate configuration
  options ??= {
    maxMemory: DEFAULT_MAXIMUM_MEMORY,
    files: false,
    filesOnly: false,
  };

  // Set optional values
  options.files ??= false;
  options.filesOnly ??= false;
  options.maxMemory ??= DEFAULT_MAXIMUM_MEMORY;

  // Return middleware
  return async (req: OpineRequest, _res: OpineResponse, next: NextFunction) => {
    // Validate proper content-type is passed into headers.
    const boundary = get_boundary(req);
    if (!boundary) return next();

    // use maxMemory to specify the maximum allocated memory for parsing.
    const form_data = await new MultipartReader(req.body, boundary).readForm(
      options?.maxMemory,
    );

    // produce the files[] list of the config specifies
    if (options?.files) {
      const files = getFormFiles(form_data);
      req.multipartFiles = files;
      // If the files only option is set then go next
      if (options?.filesOnly) {
        return next();
      }
    }

    req.multipartData = form_data;
    return next();
  };
}

function get_boundary(req: OpineRequest): null | string {
  // Check the header for Content-Type
  const contentType = req.headers.get("Content-Type");
  if (contentType == null) {
    return null;
  }

  if (contentType.includes("multipart/form-data") == false) return null;

  // Parse out boundary string from header.
  const header_rhs = contentType.split(";")[1];
  if (header_rhs.includes("=")) {
    return header_rhs.split("=")[1];
  }

  return null;
}

export function getFormFiles(form_data: MultipartFormData) {
  const files = new Array<FormFile>();

  for (const form_object of form_data) {
    // Select only the fields which contain FormFile objects.
    if (typeof form_object[1] == "object") {
      files.push(form_object[1]);
    }
  }

  return files;
}
