<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookBorrow;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BorrowController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();

    $borrows = $user->isAdmin()
      ? BookBorrow::with(['user', 'book'])->latest()->get()
      : BookBorrow::with('book')->where('user_id', $user->id)->latest()->get();

    return response()->json($borrows);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'book_id'  => 'required|integer|exists:books,id',
      'due_date' => 'nullable|date|after:today',
    ]);

    $book = Book::findOrFail($validated['book_id']);

    if ($book->stock < 1) {
      return response()->json(['message' => 'This book is currently out of stock.'], 422);
    }

    $borrow = BookBorrow::create([
      'user_id'     => $request->user()->id,
      'book_id'     => $book->id,
      'title'       => $book->title,
      'author'      => $book->author,
      'borrowed_at' => Carbon::today(),
      'due_date'    => $validated['due_date'] ?? Carbon::today()->addDays(14),
      'status'      => 'borrowed',
    ]);

    $book->decrement('stock');

    return response()->json($borrow->load('book'), 201);
  }

  public function show(Request $request, BookBorrow $bookBorrow)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $bookBorrow->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    return response()->json($bookBorrow->load(['user', 'book']));
  }

  public function returnBook(Request $request, BookBorrow $bookBorrow)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $bookBorrow->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    if ($bookBorrow->status === 'returned') {
      return response()->json(['message' => 'This book has already been returned.'], 422);
    }

    $bookBorrow->update([
      'status'      => 'returned',
      'returned_at' => Carbon::today(),
    ]);

    $bookBorrow->book()->increment('stock');

    return response()->json($bookBorrow->load('book'));
  }

  public function destroy(Request $request, BookBorrow $bookBorrow)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $bookBorrow->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    if ($bookBorrow->status === 'borrowed') {
      $bookBorrow->book()->increment('stock');
    }

    $bookBorrow->update(['status' => 'cancelled']);

    return response()->json(['message' => 'Borrow record cancelled.']);
  }
}
