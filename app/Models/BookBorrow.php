<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookBorrow extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'book_id',
    'title',
    'author',
    'requested_at',
    'approved_at',
    'borrowed_at',
    'due_date',
    'returned_at',
    'status',
  ];

  protected $casts = [
    'requested_at' => 'date',
    'approved_at'  => 'date',
    'borrowed_at'  => 'date',
    'due_date'     => 'date',
    'returned_at'  => 'date',
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function book(): BelongsTo
  {
    return $this->belongsTo(Book::class);
  }
}
