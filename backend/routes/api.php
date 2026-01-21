<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Test endpoint for mobile connection
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Backend başarıyla bağlandı!',
        'timestamp' => now(),
        'server_time' => now()->toDateTimeString(),
    ]);
});

// Your other routes...