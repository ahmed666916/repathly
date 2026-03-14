<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Doğrulama</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 40px 32px; text-align: center; }
        .logo { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
        .tagline { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px; }
        .body { padding: 40px 32px; }
        .title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
        .text { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px; }
        .token-box { background: #F0FDF4; border: 2px dashed #10B981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .token { font-family: 'Courier New', monospace; font-size: 28px; font-weight: 700; color: #059669; letter-spacing: 6px; }
        .token-label { font-size: 12px; color: #6B7280; margin-top: 6px; }
        .success-note { background: #F0FDF4; border-left: 4px solid #10B981; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #065F46; line-height: 1.5; }
        .footer { background: #F9FAFB; padding: 24px 32px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Repathly</div>
            <div class="tagline">Yolculuklarınızı Kişiselleştirin</div>
        </div>
        <div class="body">
            <div class="title">Merhaba, {{ $name }}! 👋</div>
            <div class="text">
                Repathly'ye hoş geldiniz! Hesabınızı etkinleştirmek için
                aşağıdaki doğrulama kodunu uygulamaya girin:
            </div>

            <div class="token-box">
                <div class="token">{{ $token }}</div>
                <div class="token-label">Email Doğrulama Kodu (24 saat geçerli)</div>
            </div>

            <div class="success-note">
                ✅ Bu adımı tamamladıktan sonra kişiselleştirilmiş rota önerilerine erişebileceksiniz.
            </div>
        </div>
        <div class="footer">
            © {{ date('Y') }} Repathly — Tüm hakları saklıdır.
        </div>
    </div>
</body>
</html>
