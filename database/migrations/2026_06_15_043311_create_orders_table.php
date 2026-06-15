<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('orders', function (Blueprint $table) {
      $table->id();

      // Who ordered
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();

      // What they ordered (polymorphic-style: store the product type + id)
      $table->string('product_type');           // e.g. "drink", "book", "computer", "phone"
      $table->unsignedBigInteger('product_id'); // the id in the respective table

      // Product snapshot at time of order (so data stays accurate even if product changes)
      $table->string('product_name');
      $table->decimal('unit_price', 10, 2);

      // Order details from the buy form
      $table->unsignedInteger('quantity')->default(1);
      $table->string('table_number');
      $table->string('floor');

      // Computed total
      $table->decimal('total_price', 10, 2);

      // Order status
      $table->enum('status', ['pending', 'confirmed', 'delivered', 'cancelled'])
        ->default('pending');

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('orders');
  }
};
