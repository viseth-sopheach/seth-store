<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // One category HAS MANY books
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    // One category HAS MANY drinks
    public function drinks(): HasMany
    {
        return $this->hasMany(Drink::class);
    }

    // One category HAS MANY computer products
    public function computerProducts(): HasMany
    {
        return $this->hasMany(ComputerProduct::class);
    }

    // One category HAS MANY phone products
    public function phoneProducts(): HasMany
    {
        return $this->hasMany(PhoneProduct::class);
    }
}