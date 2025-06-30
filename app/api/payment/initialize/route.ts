import { initializePaystackPayment } from '@/lib/payment/paystack';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, amount } = body;

  try {
    const response = await initializePaystackPayment({
      email,
      amount,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`, // or /success if you like
    });

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
