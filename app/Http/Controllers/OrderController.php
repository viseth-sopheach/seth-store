<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
  /**
   * List all orders for the authenticated user.
   * Admins see all orders.
   */
  public function index(Request $request)
  {
    $user = $request->user();

    $orders = $user->isAdmin()
      ? Order::with('user')->latest()->get()
      : Order::where('user_id', $user->id)->latest()->get();

    return response()->json($orders);
  }

  /**
   * Place a new order from the buy form.
   *
   * Expected payload:
   * {
   *   "product_type": "drink",        // drink | book | computer | phone
   *   "product_id":   3,
   *   "product_name": "Coca-Cola",
   *   "unit_price":   1.50,
   *   "quantity":     2,
   *   "table_number": "12",
   *   "floor":        "2nd Floor"
   * }
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'product_type' => 'required|string|in:drink,book,computer,phone',
      'product_id'   => 'required|integer|min:1',
      'product_name' => 'required|string|max:255',
      'unit_price'   => 'required|numeric|min:0',
      'quantity'     => 'required|integer|min:1',
      'table_number' => 'required|string|max:50',
      'floor'        => 'required|string|max:100',
    ]);

    $validated['user_id']     = $request->user()->id;
    $validated['total_price'] = $validated['unit_price'] * $validated['quantity'];
    $validated['status']      = 'pending';

    $order = Order::create($validated);

    return response()->json($order, 201);
  }

  /**
   * Get a single order (owner or admin only).
   */
  public function show(Request $request, Order $order)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $order->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    return response()->json($order->load('user'));
  }

  /**
   * Update order status (admin only).
   */
  public function updateStatus(Request $request, Order $order)
  {
    if (! $request->user()->isAdmin()) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    $validated = $request->validate([
      'status' => 'required|in:pending,confirmed,delivered,cancelled',
    ]);

    $order->update($validated);

    return response()->json($order);
  }

  /**
   * Cancel an order (owner or admin).
   */
  public function destroy(Request $request, Order $order)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $order->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    $order->update(['status' => 'cancelled']);

    return response()->json(['message' => 'Order cancelled.']);
  }
}
