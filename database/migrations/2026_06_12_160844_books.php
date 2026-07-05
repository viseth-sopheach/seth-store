<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('books', function (Blueprint $table) {
      $table->id();
      $table->foreignId('category_id')->constrained()->cascadeOnDelete();
      $table->string('title');
      $table->string('author');
      $table->string('genre');
      $table->decimal('price', 8, 2);
      $table->integer('stock')->default(0);
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('books');
  }
};
