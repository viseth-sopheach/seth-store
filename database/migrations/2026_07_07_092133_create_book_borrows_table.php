<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::dropIfExists('book_borrows');

    Schema::create('book_borrows', function (Blueprint $table) {
      $table->id();

      // Who requested the borrow
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();

      // Which book
      $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();

      // Snapshot at time of request
      $table->string('title');
      $table->string('author');

      // Lifecycle timestamps
      $table->date('requested_at');
      $table->date('approved_at')->nullable();
      $table->date('borrowed_at')->nullable();
      $table->date('due_date')->nullable();

      // dateTime (not date) so we can show the exact moment the user
      // clicked "Return", not just the calendar day.
      $table->dateTime('returned_at')->nullable();

      $table->enum('status', ['pending', 'approved', 'rejected', 'returned', 'cancelled'])
        ->default('pending');

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('book_borrows');
  }
};
