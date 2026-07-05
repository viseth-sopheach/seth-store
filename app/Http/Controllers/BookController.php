<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
  public function index()
  {
    $books = Book::with('category')->get()->map(function ($book) {
      $book->image_url = $book->image ? (filter_var($book->image, FILTER_VALIDATE_URL) ? $book->image : asset('storage/' . $book->image)) : null;
      return $book;
    });

    return response()->json($books);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'category_id' => 'required|exists:categories,id',
      'title'       => 'required|string|max:255',
      'author'      => 'required|string|max:255',
      'genre'       => 'required|string|max:100',
      'price'       => 'required|numeric|min:0',
      'stock'       => 'integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      $validated['image'] = $request->file('image')->store('books', 'public');
    }

    $book = Book::create($validated);
    $book->image_url = $book->image ? (filter_var($book->image, FILTER_VALIDATE_URL) ? $book->image : asset('storage/' . $book->image)) : null;

    return response()->json($book->load('category'), 201);
  }

  public function show(Book $book)
  {
    $book->image_url = $book->image ? (filter_var($book->image, FILTER_VALIDATE_URL) ? $book->image : asset('storage/' . $book->image)) : null;

    return response()->json($book->load('category'));
  }

  public function update(Request $request, Book $book)
  {
    $validated = $request->validate([
      'category_id' => 'sometimes|exists:categories,id',
      'title'       => 'sometimes|string|max:255',
      'author'      => 'sometimes|string|max:255',
      'genre'       => 'sometimes|string|max:100',
      'price'       => 'sometimes|numeric|min:0',
      'stock'       => 'sometimes|integer|min:0',
      'image'       => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
    ]);

    if ($request->hasFile('image')) {
      // Delete old image if exists
      if ($book->image) {
        Storage::disk('public')->delete($book->image);
      }
      $validated['image'] = $request->file('image')->store('books', 'public');
    }

    $book->update($validated);
    $book->image_url = $book->image ? (filter_var($book->image, FILTER_VALIDATE_URL) ? $book->image : asset('storage/' . $book->image)) : null;

    return response()->json($book->load('category'));
  }

  public function destroy(Book $book)
  {
    if ($book->image) {
      Storage::disk('public')->delete($book->image);
    }

    $book->delete();

    return response()->json(['message' => 'Book deleted successfully.']);
  }
}
