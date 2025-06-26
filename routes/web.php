<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CardTemplateController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UpgradeController;
use App\Http\Controllers\ChipController;
use App\Http\Controllers\WelcomeController;


Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');


    Route::resource('/dashboard', App\Http\Controllers\DashboardController::class);

    // Cards Management
    Route::resource('cards', CardController::class);
    Route::post('cards/{card}/stamp', [CardController::class, 'addStamp'])
        ->name('cards.stamp');
    // Card Templates
    Route::resource('templates', CardTemplateController::class);

    // Customer Management
    Route::resource('customers', CustomerController::class);
    Route::post('customers/search', [CustomerController::class, 'searchApi'])
        ->name('customers.search');

    // Upgrade Account
    Route::get('/upgrade', [UpgradeController::class, 'index'])->name('upgrade.index');
    Route::post('/upgrade', [UpgradeController::class, 'store'])->name('upgrade.store');
    Route::get('/upgrade/{reference_id}', [UpgradeController::class, 'show'])->name('upgrade.show');

    // Payment routes
    Route::post('/order/{reference_id}/pay', [OrderController::class, 'pay'])->name('order.pay');
    Route::get('/order/{reference_id}/pay', [OrderController::class, 'pay'])->name('order.pay.get');

    // Chip payment processing
    Route::get('/payment/return', [ChipController::class, 'return'])->name('payment.return');
    Route::post('/payment/callback', [ChipController::class, 'callback'])
        ->name('payment.callback')
        ->withoutMiddleware(['auth', 'verified']);

    // WhatsApp integration
    Route::get('send', [CardController::class, 'sendWhatsappMessage'])->name('send');

});

// Add this route outside the auth middleware group
Route::post('/search-card', [WelcomeController::class, 'searchCard'])->name('search.card');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
