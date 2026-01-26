<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExperienceCardController;

// Test endpoint for mobile connection
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Backend başarıyla bağlandı!',
        'timestamp' => now(),
        'server_time' => now()->toDateTimeString(),
    ]);
});

// Test POST endpoint
Route::post('/test-post', function (Request $request) {
    \Log::info('Test POST endpoint hit!', $request->all());
    return response()->json([
        'success' => true,
        'message' => 'POST request başarılı!',
        'received_data' => $request->all(),
    ]);
});

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerificationEmail']);
});

// Protected authentication routes (require Sanctum token)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Public experience cards routes
Route::prefix('experience-cards')->group(function () {
    Route::get('/', [ExperienceCardController::class, 'index']);
    Route::get('/grouped', [ExperienceCardController::class, 'grouped']);
});

// Protected experience cards routes (user selections)
Route::middleware('auth:sanctum')->prefix('user/experience-cards')->group(function () {
    Route::get('/', [ExperienceCardController::class, 'getUserCards']);
    Route::post('/', [ExperienceCardController::class, 'saveUserCards']);
    Route::put('/', [ExperienceCardController::class, 'updateUserCards']);
    Route::post('/add', [ExperienceCardController::class, 'addCard']);
    Route::post('/remove', [ExperienceCardController::class, 'removeCard']);
    Route::get('/onboarding-status', [ExperienceCardController::class, 'checkOnboardingStatus']);
});
