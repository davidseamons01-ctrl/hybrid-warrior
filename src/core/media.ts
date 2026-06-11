/** Convert any YouTube URL (watch / shorts / youtu.be / embed) → /embed/ URL. */
export function toEmbedUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  let id = "";
  let m: RegExpMatchArray | null;
  if ((m = url.match(/[?&]v=([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/youtu\.be\/([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/\/shorts\/([\w-]{6,})/))) id = m[1];
  else if ((m = url.match(/\/embed\/([\w-]{6,})/))) id = m[1];
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}`;
}
