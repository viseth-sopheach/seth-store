<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('computer_products', function (Blueprint $table) {
            $table->string('image')->nullable()->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('computer_products', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};