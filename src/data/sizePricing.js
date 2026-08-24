export const ADULT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL', '11XL', '12XL', '13XL'
];

export const KID_SIZES = [
  '22', '24', '26', '28', '30', '32', '34'
];

export const SIZES = [...KID_SIZES, ...ADULT_SIZES];

export const getBasePrice = (totalQty) => {
  if (totalQty < 5) return 80;
  if (totalQty <= 9) return 50;
  if (totalQty <= 39) return 39;
  if (totalQty <= 69) return 37;
  if (totalQty <= 99) return 34;
  return 30; // 100+ pcs
};

export const getSizeCost = (size) => {
  if (KID_SIZES.includes(size)) return -2;
  if (['3XL', '4XL', '5XL'].includes(size)) return 3;
  if (['6XL', '7XL', '8XL'].includes(size)) return 6;
  if (['9XL', '10XL', '11XL'].includes(size)) return 9;
  if (['12XL', '13XL'].includes(size)) return 12;
  return 0;
};
