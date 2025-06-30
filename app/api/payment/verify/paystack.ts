// lib/payment/paystack.ts
import axios from "axios"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing Paystack secret key in environment variables")
}

export async function initializePaystackTransaction(data: {
  email: string
  amount: number // in Naira
  metadata?: Record<string, any>
  callback_url: string
}) {
  const { email, amount, metadata, callback_url } = data

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100, // convert to kobo
      metadata,
      callback_url,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  )

  return response.data
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  })

  return response.data
}
