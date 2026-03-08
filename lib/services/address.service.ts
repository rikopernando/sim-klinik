/**
 * Address Service
 * Service for fetching Indonesian administrative divisions from Emsifa API
 * API: https://emsifa.github.io/api-wilayah-indonesia
 */

import axios from "axios"
import type { Province, City, Subdistrict, Village } from "@/types/address"
import { ApiServiceError, handleApiError } from "./api.service"

const BASE_URL = process.env.NEXT_PUBLIC_ADDRESS_SERVICE_URL

/**
 * Fetch all provinces in Indonesia
 */
export async function getProvinces(): Promise<Province[]> {
  try {
    const response = await axios.get<Province[]>(`${BASE_URL}/provinces.json`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fetch cities/regencies by province ID
 * @param provinceId - The province ID to fetch cities for
 */
export async function getCities(provinceId: string): Promise<City[]> {
  if (!provinceId) {
    throw new ApiServiceError("Province ID is required")
  }

  try {
    const response = await axios.get<City[]>(`${BASE_URL}/regencies/${provinceId}.json`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fetch subdistricts (kecamatan) by city ID
 * @param cityId - The city/regency ID to fetch subdistricts for
 */
export async function getSubdistricts(cityId: string): Promise<Subdistrict[]> {
  if (!cityId) {
    throw new ApiServiceError("City ID is required")
  }

  try {
    const response = await axios.get<Subdistrict[]>(`${BASE_URL}/districts/${cityId}.json`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fetch villages (kelurahan/desa) by subdistrict ID
 * @param subdistrictId - The subdistrict ID to fetch villages for
 */
export async function getVillages(subdistrictId: string): Promise<Village[]> {
  if (!subdistrictId) {
    throw new ApiServiceError("Subdistrict ID is required")
  }

  try {
    const response = await axios.get<Village[]>(`${BASE_URL}/villages/${subdistrictId}.json`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
