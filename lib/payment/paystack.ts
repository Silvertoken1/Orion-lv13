interface PaystackResponse {
  status: boolean
  message: string
  data?: any
}

interface PaymentData {
  email: string
  amount: number
  reference: string
  callback_url?: string
  metadata?: any
}

export async function initializePaystackPayment(paymentData: PaymentData): Promise<PaystackResponse> {
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount * 100, // Convert to kobo
        reference: paymentData.reference,
        callback_url: paymentData.callback_url,
        metadata: paymentData.metadata,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Paystack initialization error:", error)
    return {
      status: false,
      message: "Payment initialization failed",
    }
  }
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackResponse> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Paystack verification error:", error)
    return {
      status: false,
      message: "Payment verification failed",
    }
  }
}

export function generatePaymentReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `PAY_${timestamp}_${random}`.toUpperCase()
}
