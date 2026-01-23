# Laravel Authentication API - Quick Reference

## Base URL
```
http://192.168.100.23:8000/api
```

## Public Endpoints (No Authentication)

### 1. Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kayıt başarılı! Email adresinize doğrulama bağlantısı gönderildi.",
  "data": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false,
      "authProvider": "email",
      "createdAt": "2026-01-23T18:30:00.000Z"
    },
    "token": "1|abc123..."
  }
}
```

---

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Giriş başarılı!",
  "data": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePhoto": null,
      "isEmailVerified": false,
      "authProvider": "email",
      "createdAt": "2026-01-23T18:30:00.000Z"
    },
    "token": "2|xyz789..."
  }
}
```

---

### 3. Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifre sıfırlama bağlantısı email adresinize gönderildi."
}
```

---

### 4. Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz."
}
```

---

### 5. Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email adresiniz doğrulandı!"
}
```

---

### 6. Resend Verification Email
```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doğrulama emaili tekrar gönderildi."
}
```

---

## Protected Endpoints (Require Authentication)

> **Note:** All protected endpoints require the `Authorization` header with Bearer token.

### 7. Logout
```http
POST /auth/logout
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Çıkış yapıldı."
}
```

---

### 8. Get Profile
```http
GET /auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Profil bilgileri alındı.",
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePhoto": null,
    "isEmailVerified": false,
    "authProvider": "email",
    "createdAt": "2026-01-23T18:30:00.000Z"
  }
}
```

---

### 9. Update Profile
```http
PUT /auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profil güncellendi.",
  "data": {
    "id": "1",
    "name": "John Updated",
    "email": "john.new@example.com",
    "profilePhoto": "https://example.com/photo.jpg",
    "isEmailVerified": false,
    "authProvider": "email",
    "createdAt": "2026-01-23T18:30:00.000Z"
  }
}
```

---

### 10. Change Password
```http
POST /auth/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Şifreniz başarıyla değiştirildi."
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "email": ["Email adresi gereklidir."],
    "password": ["Şifre en az 6 karakter olmalıdır."]
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Geçersiz email veya şifre."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Bu email adresi ile kayıtlı kullanıcı bulunamadı."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Bir hata oluştu.",
  "error": "Detailed error message"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://192.168.100.23:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://192.168.100.23:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Profile (replace TOKEN)
```bash
curl -X GET http://192.168.100.23:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (Registration) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |
