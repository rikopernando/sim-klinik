export interface ReportSummary {
  totalBilled: number
  totalCollected: number
  outstanding: number
  collectionRate: number
  visitCount: number
  patientCount: number
  totalDiscount: number
}

export interface DailyTrendItem {
  date: string
  revenue: number
  transactions: number
}

export interface ServiceTypeItem {
  serviceType: string
  revenue: number
  count: number
}

export interface PaymentMethodItem {
  paymentMethod: string
  amount: number
  count: number
}

export interface VisitTypeItem {
  visitType: string
  revenue: number
  count: number
}

export interface FinancialReportData {
  summary: ReportSummary
  previousSummary?: ReportSummary
  dailyTrend: DailyTrendItem[]
  byServiceType: ServiceTypeItem[]
  byPaymentMethod: PaymentMethodItem[]
  byVisitType: VisitTypeItem[]
}

export interface ReportFilters {
  dateFrom: string
  dateTo: string
  prevDateFrom?: string
  prevDateTo?: string
}

export type PeriodPreset = "today" | "week" | "month" | "3months" | "year" | "custom"

export type KpiKey =
  | "total-tagihan"
  | "terkumpul"
  | "belum-lunas"
  | "collection-rate"
  | "kunjungan"
  | "pasien"

export interface KpiDetailPayment {
  id: string
  date: string
  patientName: string
  mrNumber: string
  visitNumber: string
  visitType: string
  amount: number
  paymentMethod: string
}

export interface KpiDetailBilling {
  id: string
  date: string
  patientName: string
  mrNumber: string
  visitNumber: string
  visitType: string
  totalAmount: number
  paymentStatus: string
}

export interface KpiDetailVisit {
  id: string
  date: string
  visitNumber: string
  patientName: string
  mrNumber: string
  visitType: string
  status: string
  totalAmount: number | null
}

export interface KpiDetailPatient {
  id: string
  mrNumber: string
  name: string
  visitCount: number
  totalSpent: number
  lastVisit: string
}

export type KpiDetailItem = KpiDetailPayment | KpiDetailBilling | KpiDetailVisit | KpiDetailPatient

export interface KpiDetailData {
  kpi: KpiKey
  items: KpiDetailItem[]
  total: number
  pageTotal: number
}
