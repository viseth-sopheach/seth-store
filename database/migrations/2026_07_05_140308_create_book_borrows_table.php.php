<?php
// database/migrations/2026_07_05_000000_create_book_borrows_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('book_borrows', function (Blueprint $table) {
      $table->id();

      // Who borrowed
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();

      // Which book
      $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();

      // Snapshot at time of borrow
      $table->string('title');
      $table->string('author');

      $table->date('borrowed_at');
      $table->date('due_date');
      $table->date('returned_at')->nullable();

      $table->enum('status', ['borrowed', 'returned', 'overdue', 'cancelled'])
        ->default('borrowed');

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('book_borrows');
  }
};
