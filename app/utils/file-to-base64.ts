/**
 * Read a File as a base64 string, for APIs that take binary payloads inside a
 * JSON body rather than as a multipart upload.
 *
 * `b64EncodeUnicode` is not usable here: it runs the input through
 * `encodeURIComponent`, which mangles binary content such as a DER-encoded
 * `.p12`. This reads the raw bytes instead.
 */

// Chunked so a large file does not exhaust the call stack: `String.fromCharCode`
// receives the bytes as arguments, and spreading a whole 256 KB buffer in one
// call overflows.
const CHUNK_SIZE = 0x8000;

export async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  let binary = '';

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }

  return btoa(binary);
}
