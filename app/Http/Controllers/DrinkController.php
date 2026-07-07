<?php

namespace App\Http\Controllers;

use App\Models\Drink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DrinkController extends Controller
{
  public function index()
  {
    $drinks = Drink::with('category')->get()->map(function ($drink) {
      $drink->image_url = $drink->image ? (filter_var($drink->image, FILTER_VALIDATE_URL) ? $drink->image : asset('storage/' . $drink->image)) : null;
      return $drink;
    });

    return response()->json($drinks);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'category_id' => 'required|exists:categories,id',
      'name'        => 'required|string|max:255',
      'brand'       => 'nullable|string|max:255',
      'type'        => 'nullable|in:hot,cold,alcoholic,non-alcoholic',
      'price'       => 'required|numeric|min:0',
      'stock'       => 'nullable|integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('drinks', 'public');
    }

    $drink = Drink::create($validated);
    $drink->image_url = $drink->image ? (filter_var($drink->image, FILTER_VALIDATE_URL) ? $drink->image : asset('storage/' . $drink->image)) : null;

    return response()->json($drink->load('category'), 201);
  }

  public function show($id)
  {
    $drink = Drink::findOrFail($id);
    $drink->image_url = $drink->image ? (filter_var($drink->image, FILTER_VALIDATE_URL) ? $drink->image : asset('storage/' . $drink->image)) : null;

    return response()->json($drink->load('category'));
  }

  public function update(Request $request, $id)
  {
    $drink = Drink::findOrFail($id);
    $validated = $request->validate([
      'category_id' => 'sometimes|exists:categories,id',
      'name'        => 'sometimes|string|max:255',
      'brand'       => 'nullable|string|max:255',
      'type'        => 'nullable|in:hot,cold,alcoholic,non-alcoholic',
      'price'       => 'sometimes|numeric|min:0',
      'stock'       => 'nullable|integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      if ($drink->image && !filter_var($drink->image, FILTER_VALIDATE_URL)) {
        Storage::disk('public')->delete($drink->image);
      }
      // TODO: Render's free filesystem is ephemeral; move uploads to Cloudinary or S3 before relying on persisted images.
      $validated['image'] = $request->file('image')->store('drinks', 'public');
    }

    $drink->update($validated);
    $drink->image_url = $drink->image ? (filter_var($drink->image, FILTER_VALIDATE_URL) ? $drink->image : asset('storage/' . $drink->image)) : null;

    return response()->json($drink->load('category'));
  }

  public function destroy($id)
  {
    $drink = Drink::findOrFail($id);
    if ($drink->image && !filter_var($drink->image, FILTER_VALIDATE_URL)) {
      Storage::disk('public')->delete($drink->image);
    }

    $drink->delete();

    return response()->json(null, 204);
  }
}
