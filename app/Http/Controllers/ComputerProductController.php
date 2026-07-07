<?php

namespace App\Http\Controllers;

use App\Models\ComputerProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ComputerProductController extends Controller
{
  public function index()
  {
    $products = ComputerProduct::with('category')->get()->map(function ($product) {
      $product->image_url = $product->image ? (filter_var($product->image, FILTER_VALIDATE_URL) ? $product->image : asset('storage/' . $product->image)) : null;
      return $product;
    });

    return response()->json($products);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'category_id' => 'required|exists:categories,id',
      'name'        => 'required|string|max:255',
      'brand'       => 'required|string|max:255',
      'type'        => 'required|in:laptop,desktop,monitor,accessory,component',
      'price'       => 'required|numeric|min:0',
      'specs'       => 'required|string|max:500',
      'stock'       => 'integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('computers', 'public');
    }

    $product = ComputerProduct::create($validated);
    $product->image_url = $product->image ? (filter_var($product->image, FILTER_VALIDATE_URL) ? $product->image : asset('storage/' . $product->image)) : null;

    return response()->json($product->load('category'), 201);
  }

  public function show(ComputerProduct $computerProduct)
  {
    $computerProduct->image_url = $computerProduct->image
      ? (filter_var($computerProduct->image, FILTER_VALIDATE_URL) ? $computerProduct->image : asset('storage/' . $computerProduct->image))
      : null;

    return response()->json($computerProduct->load('category'));
  }

  public function update(Request $request, $id)
  {
    $computerProduct = ComputerProduct::findOrFail($id);

    $validated = $request->validate([
      'category_id' => 'nullable|exists:categories,id',
      'name'        => 'nullable|string|max:255',
      'brand'       => 'nullable|string|max:255',
      'type'        => 'nullable|in:laptop,desktop,monitor,accessory,component',
      'price'       => 'nullable|numeric|min:0',
      'specs'       => 'nullable|string|max:500',
      'stock'       => 'nullable|integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      if ($computerProduct->image) {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($computerProduct->image);
      }
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('computers', 'public');
    }

    $updates = array_filter(
      $validated,
      fn($value) => $value !== null && $value !== ''
    );

    $computerProduct->update($updates);

    $computerProduct->image_url = $computerProduct->image
      ? (filter_var($computerProduct->image, FILTER_VALIDATE_URL)
        ? $computerProduct->image
        : asset('storage/' . $computerProduct->image))
      : null;

    return response()->json($computerProduct->load('category'));
  }

  public function destroy(ComputerProduct $computerProduct)
  {
    if ($computerProduct->image) {
      Storage::disk('public')->delete($computerProduct->image);
    }

    $computerProduct->delete();

    return response()->json(['message' => 'Computer product deleted successfully.']);
  }
}
