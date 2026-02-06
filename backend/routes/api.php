<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExperienceCardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RouteController;

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

// Protected profile (taste DNA) routes
Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'show']);
    Route::put('/', [ProfileController::class, 'update']);
    Route::get('/experience-weights', [ProfileController::class, 'getExperienceWeights']);
    Route::put('/experience-weights', [ProfileController::class, 'updateExperienceWeights']);
    Route::put('/experience-weights/{cardId}', [ProfileController::class, 'updateSingleWeight']);
    Route::delete('/experience-weights/{cardId}', [ProfileController::class, 'removeWeight']);
});

// Protected routes (saved routes/trips)
Route::middleware('auth:sanctum')->prefix('routes')->group(function () {
    Route::post('/preview', [RouteController::class, 'preview']);
    Route::get('/', [RouteController::class, 'index']);
    Route::post('/', [RouteController::class, 'store']);
    Route::get('/{uuid}', [RouteController::class, 'show']);
    Route::put('/{uuid}', [RouteController::class, 'update']);
    Route::delete('/{uuid}', [RouteController::class, 'destroy']);
    Route::post('/{uuid}/regenerate', [RouteController::class, 'regenerate']);
});
