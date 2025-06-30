export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');

  return new Response(
    `<h2>Payment Successful</h2><p>Ref: ${reference}</p>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
