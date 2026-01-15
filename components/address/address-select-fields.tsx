/**
 * Address Select Fields Component
 * Cascading selects for Indonesian address hierarchy (Province → City → Subdistrict → Village)
 */

import { useEffect } from "react"
import { UseFormSetValue } from "react-hook-form"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAddress } from "@/hooks/use-address"
import type { PatientFormData } from "@/lib/validations/registration"

interface AddressSelectFieldsProps {
  setValue: UseFormSetValue<PatientFormData>
  initialValues?: {
    provinceId?: string
    cityId?: string
    subdistrictId?: string
    villageId?: string
  }
}

export function AddressSelectFields({ setValue, initialValues }: AddressSelectFieldsProps) {
  const {
    provinces,
    cities,
    subdistricts,
    villages,
    loadingProvinces,
    loadingCities,
    loadingSubdistricts,
    loadingVillages,
    selectedProvince,
    selectedCity,
    selectedSubdistrict,
    selectedVillage,
    selectProvince,
    selectCity,
    selectSubdistrict,
    selectVillage,
  } = useAddress({ initialValues })

  // Sync selected values with form
  useEffect(() => {
    setValue("provinceId", selectedProvince?.id || "")
    setValue("provinceName", selectedProvince?.name || "")
  }, [selectedProvince, setValue])

  useEffect(() => {
    setValue("cityId", selectedCity?.id || "")
    setValue("cityName", selectedCity?.name || "")
  }, [selectedCity, setValue])

  useEffect(() => {
    setValue("subdistrictId", selectedSubdistrict?.id || "")
    setValue("subdistrictName", selectedSubdistrict?.name || "")
  }, [selectedSubdistrict, setValue])

  useEffect(() => {
    setValue("villageId", selectedVillage?.id || "")
    setValue("villageName", selectedVillage?.name || "")
  }, [selectedVillage, setValue])

  return (
    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Province Select */}
      <Field className="gap-2">
        <FieldLabel htmlFor="provinceId">Provinsi</FieldLabel>
        <Select
          onValueChange={(value) => selectProvince(value)}
          value={selectedProvince?.id || ""}
          disabled={loadingProvinces}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                loadingProvinces
                  ? "Memuat provinsi..."
                  : provinces.length === 0
                    ? "Tidak ada data provinsi"
                    : "Pilih provinsi"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* City Select */}
      <Field className="gap-2">
        <FieldLabel htmlFor="cityId">Kota/Kabupaten</FieldLabel>
        <Select
          onValueChange={(value) => selectCity(value)}
          value={selectedCity?.id || ""}
          disabled={loadingCities || !selectedProvince}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                !selectedProvince
                  ? "Pilih provinsi terlebih dahulu"
                  : loadingCities
                    ? "Memuat kota..."
                    : cities.length === 0
                      ? "Tidak ada data kota"
                      : "Pilih kota/kabupaten"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Subdistrict Select */}
      <Field className="gap-2">
        <FieldLabel htmlFor="subdistrictId">Kecamatan</FieldLabel>
        <Select
          onValueChange={(value) => selectSubdistrict(value)}
          value={selectedSubdistrict?.id || ""}
          disabled={loadingSubdistricts || !selectedCity}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                !selectedCity
                  ? "Pilih kota terlebih dahulu"
                  : loadingSubdistricts
                    ? "Memuat kecamatan..."
                    : subdistricts.length === 0
                      ? "Tidak ada data kecamatan"
                      : "Pilih kecamatan"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {subdistricts.map((subdistrict) => (
              <SelectItem key={subdistrict.id} value={subdistrict.id}>
                {subdistrict.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Village Select */}
      <Field className="gap-2">
        <FieldLabel htmlFor="villageId">Kelurahan/Desa</FieldLabel>
        <Select
          onValueChange={(value) => selectVillage(value)}
          value={selectedVillage?.id || ""}
          disabled={loadingVillages || !selectedSubdistrict}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                !selectedSubdistrict
                  ? "Pilih kecamatan terlebih dahulu"
                  : loadingVillages
                    ? "Memuat kelurahan..."
                    : villages.length === 0
                      ? "Tidak ada data kelurahan"
                      : "Pilih kelurahan/desa"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {villages.map((village) => (
              <SelectItem key={village.id} value={village.id}>
                {village.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}
