export function isProbablyPdf(path: string) {
  return path.toLowerCase().endsWith('.pdf');
}
export function isProbablyJson(path: string) {
  return path.toLowerCase().endsWith('.json');
}
