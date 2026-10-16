export function formatJapaneseDate(value) {
  const raw = String(value || "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    return raw;
  }
  return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
}

export function toDateOnly(value) {
  return String(value || "").slice(0, 10);
}
