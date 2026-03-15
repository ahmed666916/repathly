<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-create storage symlink if it doesn't exist (avoids needing to run
        // `php artisan storage:link` manually on fresh server deployments)
        $publicStoragePath = public_path('storage');
        if (!file_exists($publicStoragePath)) {
            try {
                \Artisan::call('storage:link');
            } catch (\Exception $e) {
                \Log::warning('Could not create storage symlink: ' . $e->getMessage());
            }
        }
    }
}
