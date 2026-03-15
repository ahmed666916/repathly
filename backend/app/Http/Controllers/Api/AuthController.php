<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use App\Models\UserProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new user
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password, // Will be hashed automatically
                'auth_provider' => 'email',
                'is_email_verified' => false,
            ]);

            // Create default taste DNA profile
            UserProfile::createDefault($user->id);

            // Generate and store email verification token
            $verificationToken = Str::random(6);
            DB::table('email_verification_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'email' => $user->email,
                    'token' => Hash::make($verificationToken),
                    'created_at' => now(),
                ]
            );

            // Send verification email (uses MAIL_MAILER driver from .env — 'log' in dev)
            try {
                Mail::to($user->email)->send(new VerifyEmailMail($verificationToken, $user->name));
            } catch (\Exception $mailEx) {
                // Non-fatal: log but don't fail registration
                \Log::warning('Verification email failed to send: ' . $mailEx->getMessage());
            }

            // Create Sanctum token
            $token = $user->createToken('mobile-app')->plainTextToken;

            return $this->success([
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'isEmailVerified' => $user->is_email_verified,
                    'authProvider' => $user->auth_provider,
                    'hasCompletedProfile' => $user->has_completed_profile,
                    'hasCompletedTasteDna' => $user->has_completed_taste_dna,
                    'hasSelectedExperiences' => $user->has_selected_experiences,
                    'isOnboardingCompleted' => $user->is_onboarding_completed,
                    'createdAt' => $user->created_at?->toIso8601String() ?? null,
                ],
                'token' => $token,
            ], 'Kayıt başarılı! Email adresinize doğrulama bağlantısı gönderildi.', 201);

        } catch (\Exception $e) {
            return $this->error('Kayıt sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Login user
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return $this->error('Geçersiz email veya şifre.', 401);
            }

            // Revoke all previous tokens (optional - single device login)
            // $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('mobile-app')->plainTextToken;

            return $this->success([
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profilePhoto' => $user->profile_photo ? url('storage/' . $user->profile_photo) : null,
                    'isEmailVerified' => $user->is_email_verified,
                    'authProvider' => $user->auth_provider,
                    'hasCompletedProfile' => $user->has_completed_profile,
                    'hasCompletedTasteDna' => $user->has_completed_taste_dna,
                    'hasSelectedExperiences' => $user->has_selected_experiences,
                    'isOnboardingCompleted' => $user->is_onboarding_completed,
                    'createdAt' => $user->created_at?->toIso8601String() ?? null,
                ],
                'token' => $token,
            ], 'Giriş başarılı!');

        } catch (\Exception $e) {
            return $this->error('Giriş sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Logout user (revoke token)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            return $this->success(null, 'Çıkış yapıldı.');

        } catch (\Exception $e) {
            return $this->error('Çıkış sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Send password reset token
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return $this->error('Bu email adresi ile kayıtlı kullanıcı bulunamadı.', 404);
            }

            // Generate reset token
            $token = Str::random(60);

            // Store token in password_reset_tokens table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'email' => $request->email,
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // Send password reset email
            Mail::to($user->email)->send(new ResetPasswordMail($token, $user->email));

            return $this->success(null, 'Şifre sıfırlama kodu email adresinize gönderildi.');

        } catch (\Exception $e) {
            return $this->error('Şifre sıfırlama isteği sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Reset password with token
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            // Find the reset token by searching all records
            $resetRecords = DB::table('password_reset_tokens')->get();
            $resetRecord = null;

            foreach ($resetRecords as $record) {
                if (Hash::check($request->token, $record->token)) {
                    $resetRecord = $record;
                    break;
                }
            }

            if (!$resetRecord) {
                return $this->error('Geçersiz veya süresi dolmuş sıfırlama kodu.', 400);
            }

            // Check if token is expired (60 minutes)
            if (now()->diffInMinutes($resetRecord->created_at) > 60) {
                DB::table('password_reset_tokens')->where('email', $resetRecord->email)->delete();
                return $this->error('Sıfırlama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.', 400);
            }

            // Update user password
            $user = User::where('email', $resetRecord->email)->first();
            $user->password = $request->newPassword; // Will be hashed automatically
            $user->save();

            // Delete the reset token
            DB::table('password_reset_tokens')->where('email', $resetRecord->email)->delete();

            return $this->success(null, 'Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.');

        } catch (\Exception $e) {
            return $this->error('Şifre sıfırlama sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Verify email with token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'email' => 'required|email|exists:users,email',
            ]);

            // Find verification record for this email
            $records = DB::table('email_verification_tokens')
                ->where('email', $request->email)
                ->get();

            $matched = null;
            foreach ($records as $record) {
                if (Hash::check($request->token, $record->token)) {
                    $matched = $record;
                    break;
                }
            }

            if (!$matched) {
                return $this->error('Geçersiz doğrulama kodu.', 400);
            }

            // Check token is not older than 24 hours
            if (now()->diffInHours($matched->created_at) > 24) {
                DB::table('email_verification_tokens')->where('email', $request->email)->delete();
                return $this->error('Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.', 400);
            }

            // Mark user as verified
            User::where('email', $request->email)->update(['is_email_verified' => true]);
            DB::table('email_verification_tokens')->where('email', $request->email)->delete();

            return $this->success(null, 'Email adresiniz başarıyla doğrulandı!');

        } catch (\Exception $e) {
            return $this->error('Email doğrulama sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Resend verification email
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $request->email)->first();

            if ($user->is_email_verified) {
                return $this->success(null, 'Email adresiniz zaten doğrulanmış.');
            }

            // Generate new 6-digit verification token
            $verificationToken = Str::random(6);
            DB::table('email_verification_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'email' => $user->email,
                    'token' => Hash::make($verificationToken),
                    'created_at' => now(),
                ]
            );

            Mail::to($user->email)->send(new VerifyEmailMail($verificationToken, $user->name));

            return $this->success(null, 'Doğrulama kodu email adresinize tekrar gönderildi.');

        } catch (\Exception $e) {
            return $this->error('Email gönderimi sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Get authenticated user profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return $this->success([
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'profilePhoto' => $user->profile_photo ? url('storage/' . $user->profile_photo) : null,
                'isEmailVerified' => $user->is_email_verified,
                'authProvider' => $user->auth_provider,
                'hasCompletedProfile' => $user->has_completed_profile,
                'hasCompletedTasteDna' => $user->has_completed_taste_dna,
                'hasSelectedExperiences' => $user->has_selected_experiences,
                'isOnboardingCompleted' => $user->is_onboarding_completed,
                'createdAt' => $user->created_at?->toIso8601String() ?? null,
            ], 'Profil bilgileri alındı.');

        } catch (\Exception $e) {
            return $this->error('Profil bilgileri alınırken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Update user profile
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Update only provided fields
            if ($request->has('name')) $user->name = $request->name;
            if ($request->has('bio')) $user->bio = $request->bio;
            if ($request->has('phone')) $user->phone = $request->phone;
            if ($request->has('hasCompletedProfile')) $user->has_completed_profile = $request->hasCompletedProfile;

            $user->save();

            return $this->success([
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'isEmailVerified' => $user->is_email_verified,
                    'authProvider' => $user->auth_provider,
                    'profilePhoto' => $user->profile_photo ? url('storage/' . $user->profile_photo) : null,
                    'hasCompletedProfile' => $user->has_completed_profile,
                    'hasCompletedTasteDna' => $user->has_completed_taste_dna,
                    'hasSelectedExperiences' => $user->has_selected_experiences,
                    'isOnboardingCompleted' => $user->is_onboarding_completed,
                    'createdAt' => $user->created_at?->toIso8601String() ?? null,
                ],
            ], 'Profil başarıyla güncellendi.');

        } catch (\Exception $e) {
            return $this->error('Profil güncellenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Upload user profile photo
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'photo.required' => 'Fotoğraf seçilmedi.',
                'photo.image' => 'Dosya bir resim olmalıdır.',
                'photo.mimes' => 'Fotoğraf jpeg, png, jpg veya gif formatında olmalıdır.',
                'photo.max' => 'Fotoğraf maksimum 2MB olmalıdır.',
            ]);

            $user = $request->user();

            // Delete old photo if exists
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store new photo
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->profile_photo = $path;
            $user->save();

            return $this->success([
                'profilePhoto' => url('storage/' . $path),
            ], 'Fotoğraf başarıyla yüklendi.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->error('Fotoğraf yüklenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Change user password
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Verify current password
            if (!Hash::check($request->currentPassword, $user->password)) {
                return $this->error('Mevcut şifre yanlış.', 400);
            }

            // Update password
            $user->password = $request->newPassword; // Will be hashed automatically
            $user->save();

            return $this->success(null, 'Şifreniz başarıyla değiştirildi.');

        } catch (\Exception $e) {
            return $this->error('Şifre değiştirme sırasında bir hata oluştu.', 500, $e->getMessage());
        }
    }
}
