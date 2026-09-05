export interface UserPrincipal {
  id: string;
  email: string;
  display_name: string;
  organization_id: string;
  organization_name: string;
  role: string;
}

export interface FinancialSummary {
  period_start: string;
  period_end: string;
  revenue: number | string;
  order_count: number;
  average_order_value: number | string;
  payment_success_rate: number | string;
  refund_amount: number | string;
  pending_settlement: number | string;
  expenses: number | string;
  net_cash_flow: number | string;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

export interface PaymentBreakdown {
  total_payments: number;
  succeeded: number;
  failed: number;
  refunded: number;
  success_rate: number;
  failure_reasons: Record<string, number>;
}

export interface SettlementItem {
  id: string;
  provider: string;
  expected_amount: number;
  actual_amount: number | null;
  status: string;
  expected_at: string;
  settled_at: string | null;
}

export interface AnomalyItem {
  id: string;
  entity_type: string;
  entity_id: string | null;
  anomaly_score: number | string;
  severity: string;
  explanation_features: Record<string, any>;
  detected_at: string;
}

export interface AlertItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface AlertActionResponse {
  success: boolean;
  alert_id: string;
  status: string;
  message: string;
}

export interface EvidenceGraphNode {
  id: string;
  label: string;
  type: "question" | "skill" | "fact" | "prediction" | "hypothesis" | "simulation" | "action";
  category?: string;
}

export interface EvidenceGraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface EvidenceGraph {
  nodes: EvidenceGraphNode[];
  links: EvidenceGraphLink[];
}

export interface InvestigationFollowUp {
  question: string;
  answer: string;
  skill: string;
  timestamp: string;
}

export interface InvestigationRecord {
  id: string;
  organization_id: string;
  user_id: string;
  question: string;
  status: string;
  skills_used?: string[];
  evidence: Array<{
    type: "fact" | "prediction" | "hypothesis" | "simulation";
    source: string;
    description?: string;
    data: any;
  }>;
  conclusion: {
    type: string;
    title?: string;
    text: string;
    primary_skill?: string;
    skills?: string[];
    confidence?: string;
    recommended_action?: string;
    evidence_graph?: EvidenceGraph;
    follow_ups?: InvestigationFollowUp[];
  } | null;
  created_at: string;
  completed_at: string | null;
}

export interface SimulationResult {
  baseline_revenue: number | string;
  projected_revenue: number | string;
  impact: number | string;
  assumption: string;
  scenario_details: Record<string, any>;
  classification: string;
}

export interface CSVIngestionResponse {
  success: boolean;
  total_processed: number;
  orders_created: number;
  payments_created: number;
  expenses_created: number;
  refunds_created: number;
  settlements_created: number;
  errors: string[];
}
