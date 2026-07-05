<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
  public function index()
  {
    $categories = Category::withCount(['books', 'drinks', 'computerProducts', 'phoneProducts'])
      ->get()
      ->map(function ($category) {
        $category->image_url = $category->image
          ? (filter_var($category->image, FILTER_VALIDATE_URL) ? $category->image : asset('storage/' . $category->image))
          : null;
        return $category;
      });

    return response()->json($categories);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'name'      => 'required|string|max:255',
      'slug'      => 'required|string|unique:categories,slug',
      'icon'      => 'nullable|string|max:100',
      'image'     => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
      'is_active' => 'boolean',
    ]);

    if ($request->hasFile('image')) {
      $validated['image'] = $request->file('image')->store('categories', 'public');
    }

    $category = Category::create($validated);
    $category->image_url = $category->image ? (filter_var($category->image, FILTER_VALIDATE_URL) ? $category->image : asset('storage/' . $category->image)) : null;

    return response()->json($category, 201);
  }

  public function show(Category $category)
  {
    $category->load(['books', 'drinks', 'computerProducts', 'phoneProducts']);
    $category->image_url = $category->image ? (filter_var($category->image, FILTER_VALIDATE_URL) ? $category->image : asset('storage/' . $category->image)) : null;

    return response()->json($category);
  }

  public function update(Request $request, Category $category)
  {
    $validated = $request->validate([
      'name'      => 'sometimes|string|max:255',
      'slug'      => 'sometimes|string|unique:categories,slug,' . $category->id,
      'icon'      => 'nullable|string|max:100',
      'image'     => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
      'is_active' => 'boolean',
    ]);

    if ($request->hasFile('image')) {
      if ($category->image) {
        Storage::disk('public')->delete($category->image);
      }
      $validated['image'] = $request->file('image')->store('categories', 'public');
    }

    $category->update($validated);
    $category->image_url = $category->image ? (filter_var($category->image, FILTER_VALIDATE_URL) ? $category->image : asset('storage/' . $category->image)) : null;

    return response()->json($category);
  }

  public function destroy(Category $category)
  {
    if ($category->image) {
      Storage::disk('public')->delete($category->image);
    }

    $category->delete();

    return response()->json(['message' => 'Category deleted successfully.']);
  }
}
