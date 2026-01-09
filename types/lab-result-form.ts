/**
 * Lab Result Form Types
 * Type-safe form data structures for different result templates
 */

import type {
  NumericResultTemplate,
  DescriptiveResultTemplate,
  MultiParameterResultTemplate,
  ResultTemplate,
} from "./lab"

// ============================================================================
// FORM DATA TYPES (based on template type)
// ============================================================================

/**
 * Base form fields common to all result types
 */
interface BaseResultFormData {
  isCritical: boolean
  notes?: string
}

/**
 * Form data for numeric result template
 */
export interface NumericResultFormData extends BaseResultFormData {
  resultValue: string
}

/**
 * Form data for descriptive result template
 */
export interface DescriptiveResultFormData extends BaseResultFormData {
  findings: string
  interpretation?: string
  impression?: string
}

/**
 * Form data for multi-parameter result template
 * Uses dynamic keys: param_0, param_1, etc.
 */
export type MultiParameterResultFormData = BaseResultFormData & Record<`param_${number}`, string>

/**
 * Union type for all possible form data structures
 */
export type ResultFormData =
  | NumericResultFormData
  | DescriptiveResultFormData
  | MultiParameterResultFormData

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if template is numeric
 */
export function isNumericTemplate(
  template: ResultTemplate | null
): template is NumericResultTemplate {
  return template?.type === "numeric"
}

/**
 * Check if template is descriptive
 */
export function isDescriptiveTemplate(
  template: ResultTemplate | null
): template is DescriptiveResultTemplate {
  return template?.type === "descriptive"
}

/**
 * Check if template is multi-parameter
 */
export function isMultiParameterTemplate(
  template: ResultTemplate | null
): template is MultiParameterResultTemplate {
  return template?.type === "multi_parameter"
}

/**
 * Check if form data is numeric
 */
export function isNumericFormData(data: ResultFormData): data is NumericResultFormData {
  return "resultValue" in data
}

/**
 * Check if form data is descriptive
 */
export function isDescriptiveFormData(data: ResultFormData): data is DescriptiveResultFormData {
  return "findings" in data
}

/**
 * Check if form data is multi-parameter
 */
export function isMultiParameterFormData(
  data: ResultFormData
): data is MultiParameterResultFormData {
  return Object.keys(data).some((key) => key.startsWith("param_"))
}

// ============================================================================
// HELPER TYPES FOR PARAMETER ACCESS
// ============================================================================

/**
 * Extract parameter value from multi-parameter form data
 */
export function getParameterValue(
  data: MultiParameterResultFormData,
  index: number
): string | undefined {
  return data[`param_${index}`]
}

/**
 * Create parameter key for form field registration
 */
export function createParameterKey(index: number): `param_${number}` {
  return `param_${index}` as const
}
