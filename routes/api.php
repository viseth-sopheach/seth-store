<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DrinkController;
use App\Http\Controllers\ComputerProductController;
use App\Http\Controllers\ComputerShopOrderController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PhoneProductController;

Route::controller(AuthController::class)->group(function () {
  Route::post('/login', 'login');
  Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', 'logout');
    Route::get('/user', 'me');
  });
});

Route::prefix('categories')->controller(CategoryController::class)->group(function () {
  Route::get('/', 'index');

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       'store');
    Route::get('/{id}',    'show');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});

Route::prefix('books')->controller(BookController::class)->group(function () {
  Route::get('/', 'index');

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       'store');
    Route::get('/{id}',    'show');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});

Route::prefix('drinks')->controller(DrinkController::class)->group(function () {
  Route::get('/', 'index');

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       'store');
    Route::get('/{id}',    'show');
    Route::post('/{id}',   'update');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});

// drink order
Route::middleware('auth:sanctum')->prefix('orders')->controller(OrderController::class)->group(function () {
  Route::get('/',          'index');
  Route::post('/',         'store');
  Route::get('/{order}',   'show');
  Route::patch('/{order}/status', 'updateStatus');
  Route::delete('/{order}', 'destroy');
});

Route::prefix('computer-products')->controller(ComputerProductController::class)->group(function () {
  Route::get('/', 'index');

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       'store');
    Route::get('/{id}',    'show');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});

Route::prefix('computer-shop-orders')->controller(ComputerShopOrderController::class)->group(function () {
  Route::middleware('auth:sanctum')->group(function () {
    Route::post('/', 'store');
  });

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/',        'index');
    Route::get('/{id}',    'show');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});

Route::prefix('phone-products')->controller(PhoneProductController::class)->group(function () {
  Route::get('/', 'index');

  Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/',       'store');
    Route::get('/{id}',    'show');
    Route::put('/{id}',    'update');
    Route::delete('/{id}', 'destroy');
  });
});


Route::middleware('auth:sanctum')->post('/feedback', [FeedbackController::class, 'store']);
Route::middleware('auth:sanctum')->get('/feedback', [FeedbackController::class, 'index']);