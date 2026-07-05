<?php

namespace App\Http\Controllers;

use App\Models\ComputerShopOrder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComputerShopOrderController extends Controller
{
  public function store(Request $request)
  {
    $validated = $request->validate([
      'computer_product_id' => ['required', 'integer', 'exists:computer_products,id'],
      'product_name' => ['required', 'string', 'max:255'],
      'unit_price' => ['required', 'numeric', 'min:0'],
      'quantity' => ['required', 'integer', 'min:1'],
      'address' => ['required', 'string', 'max:255'],
    ]);

    $order = ComputerShopOrder::create([
      'user_id' => $request->user()->id,
      'computer_product_id' => $validated['computer_product_id'],
      'product_name' => $validated['product_name'],
      'unit_price' => $validated['unit_price'],
      'quantity' => $validated['quantity'],
      'address' => $validated['address'],
      'total_price' => $validated['unit_price'] * $validated['quantity'],
      'status' => 'pending',
    ]);

    return response()->json($order, 201);
  }

  public function index()
  {
    return ComputerShopOrder::orderByDesc('created_at')->get();
  }

  public function show(string $id)
  {
    return ComputerShopOrder::findOrFail($id);
  }

  public function update(Request $request, string $id)
  {
    $order = ComputerShopOrder::findOrFail($id);

    $validated = $request->validate([
      'status' => ['required', Rule::in(['pending', 'confirmed', 'delivered', 'cancelled'])],
    ]);

    $order->update($validated);

    return $order;
  }


  public function destroy(string $id)
  {
    $order = ComputerShopOrder::findOrFail($id);
    $order->delete();

    return response()->json(null, 204);
  }
}
