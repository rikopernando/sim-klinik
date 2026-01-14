export interface PayloadServices {
  code: string
  name: string
  serviceType: string
  price: string
}

export interface ResultService extends PayloadServices {
  id: string
}
