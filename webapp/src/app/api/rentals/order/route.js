// POST /api/rentals/order
export async function POST(req) {
  const data = await req.json();
  const order = await booqableService.createOrder(data);
  return Response.json(order);
} 