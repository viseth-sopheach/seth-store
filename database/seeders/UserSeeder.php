<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::firstOrCreate(
            ['email' => 'admin@skybot.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
            ]
        );

        // Create Regular User
        User::firstOrCreate(
            ['email' => 'user@skybot.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => UserRole::USER,
            ]
        );
    }
}

