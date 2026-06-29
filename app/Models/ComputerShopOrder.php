<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComputerShopOrder extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'computer_product_id',
    'product_name',
    'unit_price',
    'quantity',
    'address',
    'total_price',
    'status',
  ];

  protected $casts = [
    'unit_price' => 'decimal:2',
    'total_price' => 'decimal:2',
    'quantity' => 'integer',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function computerProduct()
  {
    return $this->belongsTo(ComputerProduct::class, 'computer_product_id');
  }
}
