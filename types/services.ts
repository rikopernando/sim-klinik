export interface PayloadServices {
  code: string
  name: string
  serviceType: string
  price: string
  description: string
  category: string
}

export interface ResultService extends PayloadServices {
  id: string
  // createdAt: Date
}
