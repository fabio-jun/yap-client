const videoExtensions = [".mp4", ".webm", ".mov", ".m4v"];

export function isVideoUrl(url?: string | null) {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    const pathname = parsed.pathname.toLowerCase();
    return videoExtensions.some((extension) => pathname.endsWith(extension));
  } catch {
    const cleanUrl = url.split("?")[0].toLowerCase();
    return videoExtensions.some((extension) => cleanUrl.endsWith(extension));
  }
}
