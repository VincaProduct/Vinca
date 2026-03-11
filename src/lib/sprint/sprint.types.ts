export type SprintCadence = "monthly" | "quarterly" | "yearly";

export type SprintType = "monthly" | "quarterly" | "yearly";

export interface SprintPlanBase {
  startDate?: string;
  endDate?: string;
}

export interface MonthlySprintPlan extends SprintPlanBase {
  suggestedSIP: number;
  salaryCycle: string;
  monthLabel?: string;
}

export interface QuarterlySprintPlan extends SprintPlanBase {
  monthlySIPs: number[];
  totalQuarterlySIP: number;
  durationLabel?: string;
}

export interface AnnualSprintPlan extends SprintPlanBase {
  quarterlySIPs: number[];
  totalAnnualSIP: number;
  durationLabel?: string;
  stepUps?: number[];
}

export type SprintPlan = MonthlySprintPlan | QuarterlySprintPlan | AnnualSprintPlan | null;

export interface Sprint {
  id: string;
  title: string;
  description: string;
  cadence: SprintCadence;
  type: SprintType;
  durationLabel: string;
  timelineType?: "single" | "monthly_checkpoints" | "quarterly_checkpoints";
  getPlan?: (readings: Record<string, number | string | boolean | unknown>) => SprintPlan;
}

export interface SprintUnitForm {
  completed?: "yes" | "no";
  sipCompleted?: boolean;
  comfortLevel?: number | null;
}

export interface SprintUnitState {
  form?: SprintUnitForm;
  isOpen?: boolean;
  isDirty?: boolean;
  isSaved?: boolean;
  isCompleted?: boolean;
}

export interface SprintProgress {
  startedAt?: string;
  startDate?: string;
  endDate?: string;
  status?: "not_started" | "active" | "completed" | "completed_final" | "stopped" | "archived";
  plan?: SprintPlan;
  phaseStatus?: string[];
  units?: Record<number, SprintUnitState>;
  locked?: boolean;
  instanceId?: string;
  history?: SprintProgress[];
}

export interface SprintState {
  activeSprintId?: string | null;
  progress?: Record<string, SprintProgress>;
}
