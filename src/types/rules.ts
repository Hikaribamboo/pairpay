export interface CommonRules {
  id: string;
  contributionRatio: Record<string, number>; // キーは参加者、値は比率
  allowedCategories: string[];
  savingCategories: string[];
  monthlySavingLimit: number; // 円
  version: number;
  updatedAt: string; // ISO
};

export interface CommonRulesChangeRequest {
  id: string;
  proposerId: string;
  contributionRatio?: Record<string, number>;
  allowedCategories?: string[];
  savingCategories?: string[];
  monthlySavingLimit?: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "partially_approved";
  targetRuleVersion: number;
  appliedRuleId?: string;
  finalizedAt?: string;
};

export interface CommonRulesApproval {
  id: string;
  changeRequestId: string;
  approverId: string;
  approved: boolean;
  comment?: string;
  createdAt: string;
};
