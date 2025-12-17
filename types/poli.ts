export interface PayloadPoli {
  name: string
  code: string
  description: string
  isActive: string
}

export interface ResultPoli extends PayloadPoli {
  id: string
  createdAt: Date
}
