<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Book;
use App\Models\Drink;
use App\Models\ComputerProduct;
use App\Models\PhoneProduct;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Seed categories ──────────────────────────────────────────────
        $categories = [
            ['name' => 'Book',          'slug' => 'book',          'icon' => 'book'],
            ['name' => 'Drink',         'slug' => 'drink',         'icon' => 'coffee'],
            ['name' => 'Computer Shop', 'slug' => 'computer-shop', 'icon' => 'computer'],
            ['name' => 'Phone Shop',    'slug' => 'phone-shop',    'icon' => 'phone'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(['slug' => $data['slug']], $data);
        }

        $book     = Category::where('slug', 'book')->first();
        $drink    = Category::where('slug', 'drink')->first();
        $computer = Category::where('slug', 'computer-shop')->first();
        $phone    = Category::where('slug', 'phone-shop')->first();

        // ── 2. Seed books ───────────────────────────────────────────────────
        $books = [
            ['title' => 'Clean Code',             'author' => 'Robert C. Martin', 'genre' => 'Technology',  'price' => 39.99, 'stock' => 25],
            ['title' => 'The Pragmatic Programmer','author' => 'Dave Thomas',      'genre' => 'Technology',  'price' => 44.99, 'stock' => 18],
            ['title' => 'Harry Potter Vol.1',      'author' => 'J.K. Rowling',     'genre' => 'Fiction',     'price' => 14.99, 'stock' => 50],
            ['title' => 'Atomic Habits',           'author' => 'James Clear',      'genre' => 'Self-Help',   'price' => 19.99, 'stock' => 30],
            ['title' => 'Sapiens',                 'author' => 'Yuval Noah Harari','genre' => 'Non-Fiction', 'price' => 17.99, 'stock' => 22],
        ];

        foreach ($books as $b) {
            Book::create(array_merge(['category_id' => $book->id], $b));
        }

        // ── 3. Seed drinks ──────────────────────────────────────────────────
        $drinks = [
            ['name' => 'Espresso',       'brand' => 'Nescafe',   'type' => 'hot',          'price' => 2.50,  'stock' => 100],
            ['name' => 'Green Tea',      'brand' => 'Lipton',    'type' => 'hot',          'price' => 1.99,  'stock' => 80],
            ['name' => 'Coca-Cola 330ml','brand' => 'Coca-Cola', 'type' => 'cold',         'price' => 1.50,  'stock' => 150],
            ['name' => 'Orange Juice',   'brand' => 'Tropicana', 'type' => 'cold',         'price' => 3.20,  'stock' => 60],
            ['name' => 'Mineral Water',  'brand' => 'Evian',     'type' => 'non-alcoholic','price' => 0.99,  'stock' => 200],
        ];

        foreach ($drinks as $d) {
            Drink::create(array_merge(['category_id' => $drink->id], $d));
        }

        // ── 4. Seed computer products ───────────────────────────────────────
        $computers = [
            ['name' => 'MacBook Pro 14"',    'brand' => 'Apple',  'type' => 'laptop',    'price' => 1999.00, 'specs' => 'M3 Pro, 18GB RAM, 512GB SSD',  'stock' => 10],
            ['name' => 'Dell XPS 15',        'brand' => 'Dell',   'type' => 'laptop',    'price' => 1599.00, 'specs' => 'Intel i7, 16GB RAM, 1TB SSD',   'stock' => 8],
            ['name' => 'LG 27" 4K Monitor',  'brand' => 'LG',     'type' => 'monitor',   'price' => 499.00,  'specs' => '4K UHD, 60Hz, IPS Panel',       'stock' => 15],
            ['name' => 'Logitech MX Keys',   'brand' => 'Logitech','type' => 'accessory', 'price' => 119.00, 'specs' => 'Wireless, Backlit, Multi-Device','stock' => 30],
            ['name' => 'Custom Desktop PC',  'brand' => 'Custom', 'type' => 'desktop',   'price' => 1200.00, 'specs' => 'Ryzen 7, 32GB RAM, RTX 4060',   'stock' => 5],
        ];

        foreach ($computers as $c) {
            ComputerProduct::create(array_merge(['category_id' => $computer->id], $c));
        }

        // ── 5. Seed phone products ──────────────────────────────────────────
        $phones = [
            ['name' => 'iPhone 15 Pro',      'brand' => 'Apple',   'type' => 'smartphone', 'price' => 1099.00, 'specs' => '6.1-inch, 256GB, A17 Pro',       'stock' => 20],
            ['name' => 'Samsung Galaxy S24', 'brand' => 'Samsung', 'type' => 'smartphone', 'price' => 899.00,  'specs' => '6.2-inch, 128GB, 5G',            'stock' => 25],
            ['name' => 'iPad Air 11"',        'brand' => 'Apple',   'type' => 'tablet',     'price' => 699.00,  'specs' => 'M2 chip, 256GB, Wi-Fi',          'stock' => 12],
            ['name' => 'Apple Watch Series 9','brand' => 'Apple',  'type' => 'smartwatch', 'price' => 399.00,  'specs' => '45mm, GPS + Cellular, Always-On', 'stock' => 18],
            ['name' => 'AirPods Pro 2',       'brand' => 'Apple',  'type' => 'accessory',  'price' => 249.00,  'specs' => 'ANC, MagSafe, USB-C',            'stock' => 40],
        ];

        foreach ($phones as $p) {
            PhoneProduct::create(array_merge(['category_id' => $phone->id], $p));
        }

        $this->command->info('✅  Seeded: 4 categories, 5 books, 5 drinks, 5 computer products, 5 phone products.');
    }
}