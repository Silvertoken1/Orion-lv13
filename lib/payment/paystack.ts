interface PaystackResponse {
  status: boolean
  message: string
  data?: any
}

export async function initializePaystackPayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: any,
): Promise<PaystackResponse> {
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
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

export async function createPaystackTransferRecipient(
  name: string,
  accountNumber: string,
  bankCode: string,
): Promise<PaystackResponse> {
  try {
    const response = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Paystack transfer recipient error:", error)
    return {
      status: false,
      message: "Transfer recipient creation failed",
    }
  }
}

export async function initiatePaystackTransfer(
  amount: number,
  recipient: string,
  reason: string,
  reference: string,
): Promise<PaystackResponse> {
  try {
    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100, // Convert to kobo
        recipient,
        reason,
        reference,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Paystack transfer error:", error)
    return {
      status: false,
      message: "Transfer initiation failed",
    }
  }
}

export async function getPaystackBanks(): Promise<PaystackResponse> {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Paystack banks error:", error)
    return {
      status: false,
      message: "Failed to fetch banks",
    }
  }
}
