/**
 * Address Types
 * TypeScript interfaces for Indonesian administrative divisions
 * Used with Emsifa API (https://emsifa.github.io/api-wilayah-indonesia)
 */

export interface Province {
  id: string
  name: string
}

export interface City {
  id: string
  name: string
  province_id: string
}

export interface Subdistrict {
  id: string
  name: string
  regency_id: string
}

export interface Village {
  id: string
  name: string
  district_id: string
}

export interface AddressSelection {
  provinceId?: string
  provinceName?: string
  cityId?: string
  cityName?: string
  subdistrictId?: string
  subdistrictName?: string
  villageId?: string
  villageName?: string
}
