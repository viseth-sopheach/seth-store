<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   *
   * Rebuilds book_borrows with a request/approval workflow:
   *  - status now supports pending -> approved -> returned, plus rejected/cancelled
   *  - borrowed_at / due_date are only populated once an admin approves the request
   *  - approved_at records when the approval happened
   *
   * The table is dropped and recreated (rather than altered) to avoid
   * cross-database enum/check-constraint migration issues; this feature
   * has no production data yet.
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
      $table->date('returned_at')->nullable();

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

    Schema::create('book_borrows', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
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
};
