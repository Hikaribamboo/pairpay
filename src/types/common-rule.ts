export type FixedRules = {
  contributionRatio: number;
  allowedCategories: string[];
  savingCategories: string[];
};

export type AllRules = {
  fixed: FixedRules;
  free: string[];
};
