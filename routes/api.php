<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DrinkController;
use App\Http\Controllers\ComputerProductController;
use App\Http\Controllers\ComputerShopOrderController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PhoneProductController;

/*
|--------------------------------------------------------------------------
| API Routes - Grouped by resource
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::get('/user', [AuthController::class, 'me']);
});

// ── Categories 
Route::prefix('categories')->group(function () {
  Route::get('/', [CategoryController::class, 'index']);    // GET /api/categories — public

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       [CategoryController::class, 'store']);    // POST   /api/categories
    Route::get('/{id}',    [CategoryController::class, 'show']);     // GET    /api/categories/{id}
    Route::put('/{id}',    [CategoryController::class, 'update']);   // PUT    /api/categories/{id}
    Route::delete('/{id}', [CategoryController::class, 'destroy']);  // DELETE /api/categories/{id}
  });
});

// ── Books 
Route::prefix('books')->group(function () {
  Route::get('/', [BookController::class, 'index']);        // GET /api/books — public

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       [BookController::class, 'store']);    // POST   /api/books
    Route::get('/{id}',    [BookController::class, 'show']);     // GET    /api/books/{id}
    Route::put('/{id}',    [BookController::class, 'update']);   // PUT    /api/books/{id}
    Route::delete('/{id}', [BookController::class, 'destroy']); // DELETE /api/books/{id}
  });
});

// ── Drinks 
Route::prefix('drinks')->group(function () {
  Route::get('/', [DrinkController::class, 'index']);       // GET /api/drinks — public

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       [DrinkController::class, 'store']);    // POST   /api/drinks
    Route::get('/{id}',    [DrinkController::class, 'show']);     // GET    /api/drinks/{id}
    Route::post('/{id}',   [DrinkController::class, 'update']);   // POST   /api/drinks/{id} with image upload
    Route::put('/{id}',    [DrinkController::class, 'update']);   // PUT    /api/drinks/{id}
    Route::delete('/{id}', [DrinkController::class, 'destroy']); // DELETE /api/drinks/{id}
  });
});

// ── Computer Products 
Route::prefix('computer-products')->group(function () {
  Route::get('/', [ComputerProductController::class, 'index']);    // GET /api/computer-products — public

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       [ComputerProductController::class, 'store']);    // POST   /api/computer-products
    Route::get('/{id}',    [ComputerProductController::class, 'show']);     // GET    /api/computer-products/{id}
    Route::put('/{id}',    [ComputerProductController::class, 'update']);   // PUT    /api/computer-products/{id}
    Route::delete('/{id}', [ComputerProductController::class, 'destroy']); // DELETE /api/computer-products/{id}
  });
});

// ── Phone Products 
Route::prefix('phone-products')->group(function () {
  Route::get('/', [PhoneProductController::class, 'index']);    // GET /api/phone-products — public

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       [PhoneProductController::class, 'store']);    // POST   /api/phone-products
    Route::get('/{id}',    [PhoneProductController::class, 'show']);     // GET    /api/phone-products/{id}
    Route::put('/{id}',    [PhoneProductController::class, 'update']);   // PUT    /api/phone-products/{id}
    Route::delete('/{id}', [PhoneProductController::class, 'destroy']); // DELETE /api/phone-products/{id}
  });
});


// drink order
Route::middleware('auth:sanctum')->prefix('orders')->group(function () {

  Route::get('/',          [OrderController::class, 'index']);         // GET    /api/orders         — my orders (admin: all)
  Route::post('/',         [OrderController::class, 'store']);         // POST   /api/orders         — place order
  Route::get('/{order}',   [OrderController::class, 'show']);          // GET    /api/orders/{id}    — single order
  Route::patch('/{order}/status', [OrderController::class, 'updateStatus']); // PATCH /api/orders/{id}/status — admin update status
  Route::delete('/{order}', [OrderController::class, 'destroy']);       // DELETE /api/orders/{id}   — cancel order
});

Route::prefix('computer-shop-orders')->group(function () {
  // Authenticated customers — place an order (no admin requirement)
  Route::middleware('auth:sanctum')->group(function () {
    Route::post('/', [ComputerShopOrderController::class, 'store']); // POST /api/computer-shop-orders
  });

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/',        [ComputerShopOrderController::class, 'index']);    // GET    /api/computer-shop-orders
    Route::get('/{id}',    [ComputerShopOrderController::class, 'show']);     // GET    /api/computer-shop-orders/{id}
    Route::put('/{id}',    [ComputerShopOrderController::class, 'update']);   // PUT    /api/computer-shop-orders/{id}
    Route::delete('/{id}', [ComputerShopOrderController::class, 'destroy']);  // DELETE /api/computer-shop-orders/{id}
  });
});
