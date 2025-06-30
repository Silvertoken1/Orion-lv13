import { verifyPaystackPayment } from '@/lib/payment/paystack';

export async function POST(req: Request) {
  const body = await req.json();
  const { reference } = body;

  try {
    const result = await verifyPaystackPayment(reference);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
