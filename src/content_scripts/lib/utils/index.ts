export function safeParseInt(str: string): number | undefined {
  const v = parseInt(str);
  return isNaN(v) ? undefined : v;
}

export function safeParseFloat(str: string): number | undefined {
  const v = parseFloat(str);
  return isNaN(v) ? undefined : v;
}
