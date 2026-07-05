<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('phone_shop_orders', function (Blueprint $table) {
      $table->id();

      // One user -> many phone orders
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();

      // One phone product -> many orders
      $table->foreignId('phone_product_id')->constrained('phone_products')->cascadeOnDelete();

      // Product snapshot at time of order (so data stays accurate even if product changes later)
      $table->string('product_name');
      $table->decimal('unit_price', 10, 2);

      // Order details from the buy form
      $table->unsignedInteger('quantity')->default(1);
      $table->string('table_number');
      $table->string('floor');

      $table->decimal('total_price', 10, 2);

      $table->enum('status', ['pending', 'confirmed', 'delivered', 'cancelled'])
        ->default('pending');

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('phone_shop_orders');
  }
};
