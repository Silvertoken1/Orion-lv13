// lib/payment/paystack.ts

import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables.');
}

// Base config for Paystack
const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Interface for initializing a transaction
export interface InitializeTransactionPayload {
  email: string;
  amount: number; // in Naira (₦), will be converted to Kobo
  callback_url?: string;
  reference?: string;
  metadata?: any;
}

// Initialize Paystack payment
export async function initializePaystackPayment(payload: InitializeTransactionPayload) {
  const response = await paystack.post('/transaction/initialize', {
    email: payload.email,
    amount: payload.amount * 100, // convert to Kobo
    callback_url: payload.callback_url,
    reference: payload.reference,
    metadata: payload.metadata,
  });

  return response.data;
}

// Verify Paystack transaction
export async function verifyPaystackPayment(reference: string) {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data;
}
