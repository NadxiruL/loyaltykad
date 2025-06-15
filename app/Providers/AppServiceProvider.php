<?php

namespace App\Providers;

use App\Chip;
use Illuminate\Support\ServiceProvider;
use Illuminate\Pagination\Paginator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(Chip::class, function () {
            $config = config('services.chip');

            return new Chip(
                $config['brand_id'],
                $config['secret_key'],
                $config['payment_method_whitelist'],
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
    }
}
