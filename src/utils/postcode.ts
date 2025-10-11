import { AddressRow } from '@/type/addresses';

// 郵便番号から住所を検索
export const findAddressByZip = async (zip7: string): Promise<AddressRow | null> => {
  const res = await fetch('/predict-number-app/data/addresses.json');
  const db = await res.json();

  const exact = db.find((r: AddressRow) => r.zipcode === zip7);
  if (exact) return exact;
  return null;
};
