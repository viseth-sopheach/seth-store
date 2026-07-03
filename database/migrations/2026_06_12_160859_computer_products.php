<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('computer_products', function (Blueprint $table) {
      $table->id();
      $table->foreignId('category_id')->constrained()->cascadeOnDelete();
      $table->string('name');
      $table->string('brand');
      $table->enum('type', ['laptop', 'desktop', 'accessory']);
      $table->decimal('price', 10, 2);
      $table->string('specs');
      $table->integer('stock')->default(0);
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('computer_products');
  }
};
