export interface BasicUser {
  id: string
  name: string
  email: string
}

export type Doctor = BasicUser

export type Pharmacist = BasicUser

export type Nurse = BasicUser
