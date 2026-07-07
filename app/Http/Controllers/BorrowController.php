<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookBorrow;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BorrowController extends Controller
{
  /**
   * List borrow records.
   * Admins see every request (all statuses, all users).
   * Regular users only ever see their own requests — never another user's.
   */
  public function index(Request $request)
  {
    $user = $request->user();

    $borrows = $user->isAdmin()
      ? BookBorrow::with(['user', 'book'])->latest()->get()
      : BookBorrow::with('book')->where('user_id', $user->id)->latest()->get();

    return response()->json($borrows);
  }

  /**
   * Create a pending borrow request. Nothing is actually "borrowed" yet —
   * an admin must approve it first.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'book_id' => 'required|integer|exists:books,id',
    ]);

    $book = Book::findOrFail($validated['book_id']);

    if ($book->stock < 1) {
      return response()->json(['message' => 'This book is currently out of stock.'], 422);
    }

    $borrow = BookBorrow::create([
      'user_id'      => $request->user()->id,
      'book_id'      => $book->id,
      'title'        => $book->title,
      'author'       => $book->author,
      'requested_at' => Carbon::now('Asia/Phnom_Penh')->toDateString(),
      'status'       => 'pending',
    ]);

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

  /**
   * Admin-only: approve a pending request. This is the point at which the
   * book is actually reserved (stock decremented) and the due date is set.
   */
  public function approve(Request $request, BookBorrow $bookBorrow)
  {
    if ($bookBorrow->status !== 'pending') {
      return response()->json(['message' => 'Only pending requests can be approved.'], 422);
    }

    $book = $bookBorrow->book;

    if (! $book || $book->stock < 1) {
      return response()->json(['message' => 'This book is no longer in stock.'], 422);
    }

    $today = Carbon::now('Asia/Phnom_Penh')->startOfDay();

    $bookBorrow->update([
      'status'      => 'approved',
      'approved_at' => $today->toDateString(),
      'borrowed_at' => $today->toDateString(),
      'due_date'    => $today->copy()->addDays(14)->toDateString(),
    ]);

    $book->decrement('stock');

    return response()->json($bookBorrow->load(['user', 'book']));
  }

  /**
   * Admin-only: reject a pending request.
   */
  public function reject(Request $request, BookBorrow $bookBorrow)
  {
    if ($bookBorrow->status !== 'pending') {
      return response()->json(['message' => 'Only pending requests can be rejected.'], 422);
    }

    $bookBorrow->update(['status' => 'rejected']);

    return response()->json($bookBorrow->load(['user', 'book']));
  }

  public function returnBook(Request $request, BookBorrow $bookBorrow)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $bookBorrow->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    if ($bookBorrow->status !== 'approved') {
      return response()->json(['message' => 'Only approved borrows can be returned.'], 422);
    }

    $bookBorrow->update([
      'status'      => 'returned',
      'returned_at' => Carbon::now('Asia/Phnom_Penh')->toDateString(),
    ]);

    $bookBorrow->book()->increment('stock');

    return response()->json($bookBorrow->load('book'));
  }

  /**
   * Cancel a request. Users may cancel their own pending requests;
   * admins may cancel any request that hasn't been returned yet.
   */
  public function destroy(Request $request, BookBorrow $bookBorrow)
  {
    $user = $request->user();

    if (! $user->isAdmin() && $bookBorrow->user_id !== $user->id) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    if (in_array($bookBorrow->status, ['returned', 'cancelled', 'rejected'])) {
      return response()->json(['message' => 'This request can no longer be cancelled.'], 422);
    }

    if ($bookBorrow->status === 'approved') {
      $bookBorrow->book()->increment('stock');
    }

    $bookBorrow->update(['status' => 'cancelled']);

    return response()->json(['message' => 'Borrow record cancelled.']);
  }
}
