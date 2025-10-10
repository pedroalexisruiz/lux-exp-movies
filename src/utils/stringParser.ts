export const parseDateString = (dateString: string) => {
  return new Date(dateString);
};

export const parseYearString = (dateString: string) => {
  return parseDateString(dateString).getFullYear().toString();
};

export const parseAverage = (num: number) => {
  return num.toFixed(1);
};
