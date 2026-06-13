<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhoneProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'brand',
        'type',
        'price',
        'specs',
        'stock',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}