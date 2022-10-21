// --------------------------------------------------
// ----------   LIBRARY INTERFACES    ---------------
// --------------------------------------------------

/* Defines the maximum memory for use in parsing before writing to temporaryFiles. */
export const DEFAULT_MAXIMUM_MEMORY = 1048576;

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

export interface FormData {
  formData: MultipartFormData; // Contains all parsed MultipartFormData from request.
  files: FormFile[]; // Contains array of parsed files if the files: true option is selected.
}

// ---------------------------------------------------
// ---------- LIBRARY COMMON FUNCTIONS ---------------
// ---------------------------------------------------

/**
 * Get the boundary-delimiter from the Content-Type header.
 */
export function getBoundary(headers: Headers): null | string {
  // Check the header for Content-Type
  const contentType = headers.get("Content-Type");
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

/**
 * Given a parsed MultipartFormData object will return an array of FormFiles uploaded.
 */
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
