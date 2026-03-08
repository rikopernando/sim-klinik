/**
 * useAddress Hook
 * Custom hook for managing cascading address selection (Province → City → Subdistrict → Village)
 */

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { Province, City, Subdistrict, Village, AddressSelection } from "@/types/address"
import {
  getProvinces,
  getCities,
  getSubdistricts,
  getVillages,
} from "@/lib/services/address.service"
import { getErrorMessage } from "@/lib/utils/error"

interface UseAddressOptions {
  initialValues?: AddressSelection
  autoLoadProvinces?: boolean
}

interface UseAddressReturn {
  // Data arrays
  provinces: Province[]
  cities: City[]
  subdistricts: Subdistrict[]
  villages: Village[]

  // Loading states
  loadingProvinces: boolean
  loadingCities: boolean
  loadingSubdistricts: boolean
  loadingVillages: boolean

  // Selected values
  selectedProvince: Province | null
  selectedCity: City | null
  selectedSubdistrict: Subdistrict | null
  selectedVillage: Village | null

  // Selection handlers (returns the selected item for form integration)
  selectProvince: (provinceId: string) => Province | null
  selectCity: (cityId: string) => City | null
  selectSubdistrict: (subdistrictId: string) => Subdistrict | null
  selectVillage: (villageId: string) => Village | null

  // Utility functions
  resetAddress: () => void
  getAddressSelection: () => AddressSelection
}

export function useAddress(options: UseAddressOptions = {}): UseAddressReturn {
  const { initialValues, autoLoadProvinces = true } = options

  // Data arrays
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])
  const [villages, setVillages] = useState<Village[]>([])

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)

  // Selected values
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<Subdistrict | null>(null)
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null)

  // Fetch provinces on mount
  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true)
    try {
      const data = await getProvinces()
      setProvinces(data)
    } catch (error) {
      toast.error(`Gagal memuat provinsi: ${getErrorMessage(error)}`)
    } finally {
      setLoadingProvinces(false)
    }
  }, [])

  // Fetch cities when province changes
  const fetchCities = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setCities([])
      return
    }

    setLoadingCities(true)
    try {
      const data = await getCities(provinceId)
      setCities(data)
    } catch (error) {
      toast.error(`Gagal memuat kota: ${getErrorMessage(error)}`)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }, [])

  // Fetch subdistricts when city changes
  const fetchSubdistricts = useCallback(async (cityId: string) => {
    if (!cityId) {
      setSubdistricts([])
      return
    }

    setLoadingSubdistricts(true)
    try {
      const data = await getSubdistricts(cityId)
      setSubdistricts(data)
    } catch (error) {
      toast.error(`Gagal memuat kecamatan: ${getErrorMessage(error)}`)
      setSubdistricts([])
    } finally {
      setLoadingSubdistricts(false)
    }
  }, [])

  // Fetch villages when subdistrict changes
  const fetchVillages = useCallback(async (subdistrictId: string) => {
    if (!subdistrictId) {
      setVillages([])
      return
    }

    setLoadingVillages(true)
    try {
      const data = await getVillages(subdistrictId)
      setVillages(data)
    } catch (error) {
      toast.error(`Gagal memuat kelurahan: ${getErrorMessage(error)}`)
      setVillages([])
    } finally {
      setLoadingVillages(false)
    }
  }, [])

  // Load provinces on mount
  useEffect(() => {
    if (autoLoadProvinces) {
      fetchProvinces()
    }
  }, [autoLoadProvinces, fetchProvinces])

  // Initialize from initial values
  useEffect(() => {
    if (initialValues && provinces.length > 0) {
      // Set province if provided
      if (initialValues.provinceId) {
        const province = provinces.find((p) => p.id === initialValues.provinceId)
        if (province) {
          setSelectedProvince(province)
          fetchCities(province.id)
        }
      }
    }
  }, [initialValues, provinces, fetchCities])

  // Selection handlers
  const selectProvince = useCallback(
    (provinceId: string): Province | null => {
      const province = provinces.find((p) => p.id === provinceId) || null
      setSelectedProvince(province)

      // Reset dependent selections
      setSelectedCity(null)
      setSelectedSubdistrict(null)
      setSelectedVillage(null)
      setSubdistricts([])
      setVillages([])

      // Fetch cities for selected province
      if (province) {
        fetchCities(province.id)
      } else {
        setCities([])
      }

      return province
    },
    [provinces, fetchCities]
  )

  const selectCity = useCallback(
    (cityId: string): City | null => {
      const city = cities.find((c) => c.id === cityId) || null
      setSelectedCity(city)

      // Reset dependent selections
      setSelectedSubdistrict(null)
      setSelectedVillage(null)
      setVillages([])

      // Fetch subdistricts for selected city
      if (city) {
        fetchSubdistricts(city.id)
      } else {
        setSubdistricts([])
      }

      return city
    },
    [cities, fetchSubdistricts]
  )

  const selectSubdistrict = useCallback(
    (subdistrictId: string): Subdistrict | null => {
      const subdistrict = subdistricts.find((s) => s.id === subdistrictId) || null
      setSelectedSubdistrict(subdistrict)

      // Reset dependent selections
      setSelectedVillage(null)

      // Fetch villages for selected subdistrict
      if (subdistrict) {
        fetchVillages(subdistrict.id)
      } else {
        setVillages([])
      }

      return subdistrict
    },
    [subdistricts, fetchVillages]
  )

  const selectVillage = useCallback(
    (villageId: string): Village | null => {
      const village = villages.find((v) => v.id === villageId) || null
      setSelectedVillage(village)
      return village
    },
    [villages]
  )

  // Reset all selections
  const resetAddress = useCallback(() => {
    setSelectedProvince(null)
    setSelectedCity(null)
    setSelectedSubdistrict(null)
    setSelectedVillage(null)
    setCities([])
    setSubdistricts([])
    setVillages([])
  }, [])

  // Get current address selection for form submission
  const getAddressSelection = useCallback((): AddressSelection => {
    return {
      provinceId: selectedProvince?.id,
      provinceName: selectedProvince?.name,
      cityId: selectedCity?.id,
      cityName: selectedCity?.name,
      subdistrictId: selectedSubdistrict?.id,
      subdistrictName: selectedSubdistrict?.name,
      villageId: selectedVillage?.id,
      villageName: selectedVillage?.name,
    }
  }, [selectedProvince, selectedCity, selectedSubdistrict, selectedVillage])

  return {
    // Data
    provinces,
    cities,
    subdistricts,
    villages,

    // Loading states
    loadingProvinces,
    loadingCities,
    loadingSubdistricts,
    loadingVillages,

    // Selected values
    selectedProvince,
    selectedCity,
    selectedSubdistrict,
    selectedVillage,

    // Handlers
    selectProvince,
    selectCity,
    selectSubdistrict,
    selectVillage,

    // Utilities
    resetAddress,
    getAddressSelection,
  }
}
