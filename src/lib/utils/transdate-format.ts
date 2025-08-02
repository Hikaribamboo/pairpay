// utils/date.ts
type AnyDate =
  | Date
  | {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
      _seconds?: number;
      _nanoseconds?: number;
    }
  | string
  | number
  | null
  | undefined;

function toDate(value: AnyDate): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;

  // Firestore Timestamp（client/admin）: toDate() がある場合
  if (typeof (value as any).toDate === "function")
    return (value as any).toDate();

  const v = value as any;

  // Next.js 経由でシリアライズされた形: {_seconds, _nanoseconds}
  if (typeof v?._seconds === "number") {
    return new Date(
      v._seconds * 1000 + Math.floor((v._nanoseconds ?? 0) / 1e6)
    );
  }
  // 素の Timestamp 風: {seconds, nanoseconds}
  if (typeof v?.seconds === "number") {
    return new Date(v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1e6));
  }

  // ISO文字列 / ミリ秒
  const d = new Date(value as any);
  return isNaN(d.getTime()) ? null : d;
}

export function transDateFormat(value: AnyDate): string {
  const d = toDate(value);
  return d ? `${d.getMonth() + 1}/${d.getDate()}` : "-";
}
