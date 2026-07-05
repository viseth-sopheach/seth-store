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
    // Seed users 
    $this->call(UserSeeder::class);

    // Seed categories
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

    // Test Image URL
    $testImageUrl = 'https://media.istockphoto.com/id/1314343964/photo/top-end-system-unit-for-gaming-computer-close-up.jpg?s=2048x2048&w=is&k=20&c=gz1quan2pGMzCMIYUfzfxCSGgCz0asnPNu0B3rclQTI=';

    // Seed books
    $books = [
      ['title' => 'Clean Code',              'author' => 'Robert C. Martin', 'genre' => 'Technology',  'price' => 39.99, 'stock' => 25, 'image' => $testImageUrl],
      ['title' => 'The Pragmatic Programmer', 'author' => 'Dave Thomas',      'genre' => 'Technology',  'price' => 44.99, 'stock' => 18, 'image' => $testImageUrl],
      ['title' => 'Harry Potter Vol.1',      'author' => 'J.K. Rowling',     'genre' => 'Fiction',     'price' => 14.99, 'stock' => 50, 'image' => $testImageUrl],
      ['title' => 'Atomic Habits',           'author' => 'James Clear',      'genre' => 'Self-Help',   'price' => 19.99, 'stock' => 30, 'image' => $testImageUrl],
      ['title' => 'Sapiens',                 'author' => 'Yuval Noah Harari', 'genre' => 'Non-Fiction', 'price' => 17.99, 'stock' => 22, 'image' => $testImageUrl],
    ];

    foreach ($books as $b) {
      Book::create(array_merge(['category_id' => $book->id], $b));
    }

    // Seed drinks
    $drinks = [
      ['name' => 'Espresso',       'brand' => 'Nescafe',   'type' => 'hot',          'price' => 2.50,  'stock' => 100, 'image' => $testImageUrl],
      ['name' => 'Green Tea',      'brand' => 'Lipton',    'type' => 'hot',          'price' => 1.99,  'stock' => 80,  'image' => $testImageUrl],
      ['name' => 'Coca-Cola 330ml', 'brand' => 'Coca-Cola', 'type' => 'cold',         'price' => 1.50,  'stock' => 150, 'image' => $testImageUrl],
      ['name' => 'Orange Juice',   'brand' => 'Tropicana', 'type' => 'cold',         'price' => 3.20,  'stock' => 60,  'image' => $testImageUrl],
      ['name' => 'Mineral Water',  'brand' => 'Evian',     'type' => 'non-alcoholic', 'price' => 0.99,  'stock' => 200, 'image' => $testImageUrl],
    ];

    foreach ($drinks as $d) {
      Drink::create(array_merge(['category_id' => $drink->id], $d));
    }

    //Seed computer products
    $computers = [
      ['name' => 'MacBook Pro 14"',    'brand' => 'Apple',  'type' => 'laptop',    'price' => 1999.00, 'specs' => 'M3 Pro, 18GB RAM, 512GB SSD',  'stock' => 10, 'image' => $testImageUrl],
      ['name' => 'Dell XPS 15',        'brand' => 'Dell',   'type' => 'laptop',    'price' => 1599.00, 'specs' => 'Intel i7, 16GB RAM, 1TB SSD',   'stock' => 8,  'image' => $testImageUrl],
      ['name' => 'LG 27" 4K Monitor',  'brand' => 'LG',     'type' => 'monitor',   'price' => 499.00,  'specs' => '4K UHD, 60Hz, IPS Panel',       'stock' => 15, 'image' => $testImageUrl],
      ['name' => 'Logitech MX Keys',   'brand' => 'Logitech', 'type' => 'accessory', 'price' => 119.00, 'specs' => 'Wireless, Backlit, Multi-Device', 'stock' => 30, 'image' => $testImageUrl],
      ['name' => 'Custom Desktop PC',  'brand' => 'Custom', 'type' => 'desktop',   'price' => 1200.00, 'specs' => 'Ryzen 7, 32GB RAM, RTX 4060',   'stock' => 5,  'image' => $testImageUrl],
    ];

    foreach ($computers as $c) {
      ComputerProduct::create(array_merge(['category_id' => $computer->id], $c));
    }

    // Seed phone products
    $phones = [
      ['name' => 'iPhone 15 Pro',      'brand' => 'Apple',   'type' => 'smartphone', 'price' => 1099.00, 'specs' => '6.1-inch, 256GB, A17 Pro',       'stock' => 20, 'image' => $testImageUrl],
      ['name' => 'Samsung Galaxy S24', 'brand' => 'Samsung', 'type' => 'smartphone', 'price' => 899.00,  'specs' => '6.2-inch, 128GB, 5G',            'stock' => 25, 'image' => $testImageUrl],
      ['name' => 'iPad Air 11"',        'brand' => 'Apple',   'type' => 'tablet',     'price' => 699.00,  'specs' => 'M2 chip, 256GB, Wi-Fi',          'stock' => 12, 'image' => $testImageUrl],
      ['name' => 'Apple Watch Series 9', 'brand' => 'Apple',  'type' => 'smartwatch', 'price' => 399.00,  'specs' => '45mm, GPS + Cellular, Always-On', 'stock' => 18, 'image' => $testImageUrl],
      ['name' => 'AirPods Pro 2',       'brand' => 'Apple',  'type' => 'accessory',  'price' => 249.00,  'specs' => 'ANC, MagSafe, USB-C',            'stock' => 40, 'image' => $testImageUrl],
    ];

    foreach ($phones as $p) {
      PhoneProduct::create(array_merge(['category_id' => $phone->id], $p));
    }

    $this->command?->info(' Seeded: 4 categories, 5 books, 5 drinks, 5 computer products, 5 phone products with images.');
  }
}
