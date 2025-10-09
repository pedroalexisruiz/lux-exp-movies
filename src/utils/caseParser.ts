/* eslint-disable @typescript-eslint/no-explicit-any */
export function toCamelCaseKeys<T>(obj: any): T {
  const toCamel = (str: string) =>
    str.replace(/([-_][a-z])/gi, (s) => s.toUpperCase().replace(/[-_]/, ''));

  if (Array.isArray(obj)) return obj.map(toCamelCaseKeys) as T;
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      (acc as any)[toCamel(key)] = toCamelCaseKeys(val);
      return acc;
    }, {} as any) as T;
  }
  return obj;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
