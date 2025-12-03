/**
 * Vital Signs Utility Functions
 * Calculations and validations for vital signs
 */

/**
 * Calculate BMI (Body Mass Index)
 */
export function calculateBMI(heightCm: string, weightKg: string): string | null {
  const height = parseFloat(heightCm)
  const weight = parseFloat(weightKg)

  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    return null
  }

  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)

  return bmi.toFixed(2)
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: string | null): string {
  if (!bmi) return "N/A"

  const bmiValue = parseFloat(bmi)

  if (bmiValue < 18.5) return "Underweight"
  if (bmiValue < 25) return "Normal"
  if (bmiValue < 30) return "Overweight"
  return "Obese"
}

/**
 * Get BMI category in Indonesian
 */
export function getBMICategoryID(bmi: string | null): string {
  if (!bmi) return "N/A"

  const bmiValue = parseFloat(bmi)

  if (bmiValue < 18.5) return "Kurus"
  if (bmiValue < 25) return "Normal"
  if (bmiValue < 30) return "Gemuk"
  return "Obesitas"
}

/**
 * Format blood pressure
 */
export function formatBloodPressure(systolic: number | null, diastolic: number | null): string {
  if (!systolic || !diastolic) return "-"
  return `${systolic}/${diastolic} mmHg`
}

/**
 * Get blood pressure category
 */
export function getBloodPressureCategory(
  systolic: number | null,
  diastolic: number | null
): string {
  if (!systolic || !diastolic) return "N/A"

  if (systolic < 90 || diastolic < 60) return "Low"
  if (systolic < 120 && diastolic < 80) return "Normal"
  if (systolic < 130 && diastolic < 80) return "Elevated"
  if (systolic < 140 || diastolic < 90) return "High Stage 1"
  return "High Stage 2"
}

/**
 * Get blood pressure category in Indonesian
 */
export function getBloodPressureCategoryID(
  systolic: number | null,
  diastolic: number | null
): string {
  if (!systolic || !diastolic) return "N/A"

  if (systolic < 90 || diastolic < 60) return "Rendah"
  if (systolic < 120 && diastolic < 80) return "Normal"
  if (systolic < 130 && diastolic < 80) return "Meningkat"
  if (systolic < 140 || diastolic < 90) return "Tinggi Tahap 1"
  return "Tinggi Tahap 2"
}

/**
 * Validate temperature range (Celsius)
 */
export function isValidTemperature(temp: string | null): boolean {
  if (!temp) return false
  const value = parseFloat(temp)
  return value >= 35 && value <= 42
}

/**
 * Get temperature status
 */
export function getTemperatureStatus(temp: string | null): "low" | "normal" | "high" | "N/A" {
  if (!temp) return "N/A"
  const value = parseFloat(temp)

  if (value < 36.1) return "low"
  if (value <= 37.2) return "normal"
  return "high"
}

/**
 * Validate pulse range (bpm)
 */
export function isValidPulse(pulse: number | null): boolean {
  if (!pulse) return false
  return pulse >= 40 && pulse <= 200
}

/**
 * Get pulse status
 */
export function getPulseStatus(pulse: number | null): "low" | "normal" | "high" | "N/A" {
  if (!pulse) return "N/A"

  if (pulse < 60) return "low"
  if (pulse <= 100) return "normal"
  return "high"
}

/**
 * Validate oxygen saturation
 */
export function isValidOxygenSaturation(spo2: string | null): boolean {
  if (!spo2) return false
  const value = parseFloat(spo2)
  return value >= 0 && value <= 100
}

/**
 * Get oxygen saturation status
 */
export function getOxygenSaturationStatus(
  spo2: string | null
): "critical" | "low" | "normal" | "N/A" {
  if (!spo2) return "N/A"
  const value = parseFloat(spo2)

  if (value < 90) return "critical"
  if (value < 95) return "low"
  return "normal"
}

/**
 * Format pain scale description
 */
export function getPainScaleDescription(scale: number | null): string {
  if (scale === null) return "Tidak ada data"

  if (scale === 0) return "Tidak ada nyeri"
  if (scale <= 3) return "Nyeri ringan"
  if (scale <= 6) return "Nyeri sedang"
  if (scale <= 9) return "Nyeri berat"
  return "Nyeri sangat berat"
}

/**
 * Get consciousness level color
 */
export function getConsciousnessColor(level: string | null): string {
  if (!level) return "text-gray-500"

  const normalized = level.toLowerCase()

  if (normalized.includes("alert") || normalized.includes("sadar")) {
    return "text-green-600"
  }
  if (normalized.includes("confused") || normalized.includes("bingung")) {
    return "text-yellow-600"
  }
  if (normalized.includes("drowsy") || normalized.includes("mengantuk")) {
    return "text-orange-600"
  }
  return "text-red-600" // Unresponsive
}

/**
 * Check if vital signs are within normal range
 */
export function areVitalsNormal(vitals: {
  temperature?: string | null
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  pulse?: number | null
  oxygenSaturation?: string | null
}): boolean {
  const tempStatus = getTemperatureStatus(vitals.temperature || null)
  const bpCategory = getBloodPressureCategory(
    vitals.bloodPressureSystolic || null,
    vitals.bloodPressureDiastolic || null
  )
  const pulseStatus = getPulseStatus(vitals.pulse || null)
  const spo2Status = getOxygenSaturationStatus(vitals.oxygenSaturation || null)

  return (
    tempStatus === "normal" &&
    bpCategory === "Normal" &&
    pulseStatus === "normal" &&
    spo2Status === "normal"
  )
}
