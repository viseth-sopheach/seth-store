<?php

namespace App\Http\Controllers;

use App\Models\PhoneProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhoneProductController extends Controller
{
  public function index()
  {
    $products = PhoneProduct::with('category')->get()->map(function ($product) {
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
      'type'        => 'required|in:smartphone,tablet,accessory,smartwatch',
      'price'       => 'required|numeric|min:0',
      'specs'       => 'required|string|max:500',
      'stock'       => 'integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('phones', 'public');
    }

    $product = PhoneProduct::create($validated);
    $product->image_url = $product->image ? (filter_var($product->image, FILTER_VALIDATE_URL) ? $product->image : asset('storage/' . $product->image)) : null;

    return response()->json($product->load('category'), 201);
  }

  public function show(PhoneProduct $phoneProduct)
  {
    $phoneProduct->image_url = $phoneProduct->image
      ? (filter_var($phoneProduct->image, FILTER_VALIDATE_URL) ? $phoneProduct->image : asset('storage/' . $phoneProduct->image))
      : null;

    return response()->json($phoneProduct->load('category'));
  }

  public function update(Request $request, PhoneProduct $phoneProduct)
  {
    $validated = $request->validate([
      'category_id' => 'sometimes|exists:categories,id',
      'name'        => 'sometimes|string|max:255',
      'brand'       => 'sometimes|string|max:255',
      'type'        => 'sometimes|in:smartphone,tablet,accessory,smartwatch',
      'price'       => 'sometimes|numeric|min:0',
      'specs'       => 'sometimes|string|max:500',
      'stock'       => 'sometimes|integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      if ($phoneProduct->image) {
        Storage::disk('public')->delete($phoneProduct->image);
      }
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('phones', 'public');
    }

    $phoneProduct->update($validated);
    $phoneProduct->image_url = $phoneProduct->image ? (filter_var($phoneProduct->image, FILTER_VALIDATE_URL) ? $phoneProduct->image : asset('storage/' . $phoneProduct->image)) : null;

    return response()->json($phoneProduct->load('category'));
  }

  public function destroy(PhoneProduct $phoneProduct)
  {
    if ($phoneProduct->image) {
      Storage::disk('public')->delete($phoneProduct->image);
    }

    $phoneProduct->delete();

    return response()->json(['message' => 'Phone product deleted successfully.']);
  }
}
