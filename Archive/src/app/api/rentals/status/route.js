// POST /api/rentals/status
export async function POST(req) {
  const data = await req.json();
  const order = await booqableService.updateOrderStatus(data);
  return Response.json(order);
} 