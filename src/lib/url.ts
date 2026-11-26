export function url(path: `/${string}` | `#${string}` = '/') {
  if (path.startsWith('#')) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}

export function problemUrl(id: string) {
  return url(`/practice/${id}/`);
}
