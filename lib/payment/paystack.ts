interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: any
    log: any
    fees: number
    fees_split: any
    authorization: any
    customer: any
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables")
}

export class PaystackService {
  private headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  }

  async initializeTransaction(data: {
    email: string
    amount: number
    reference: string
    callback_url?: string
    metadata?: any
  }): Promise<PaystackInitializeResponse> {
    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          ...data,
          amount: data.amount * 100, // Convert to kobo
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack initialize error:", error)
      throw new Error("Failed to initialize payment")
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: "GET",
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack verify error:", error)
      throw new Error("Failed to verify payment")
    }
  }

  async listTransactions(params?: {
    perPage?: number
    page?: number
    customer?: string
    status?: string
    from?: string
    to?: string
    amount?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }

      const url = `${PAYSTACK_BASE_URL}/transaction${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack list transactions error:", error)
      throw new Error("Failed to fetch transactions")
    }
  }

  generateReference(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `BO_${timestamp}_${random}`
  }
}

export const paystackService = new PaystackService()
