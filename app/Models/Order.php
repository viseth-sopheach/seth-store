<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'product_type',
    'product_id',
    'product_name',
    'unit_price',
    'quantity',
    'table_number',
    'floor',
    'total_price',
    'status',
  ];

  protected $casts = [
    'unit_price'  => 'decimal:2',
    'total_price' => 'decimal:2',
    'quantity'    => 'integer',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }
}
