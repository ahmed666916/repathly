<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Şifre Sıfırlama</title>
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
        .warning { background: #FFF7ED; border-left: 4px solid #F59E0B; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #92400E; line-height: 1.5; }
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
            <div class="title">Şifre Sıfırlama İsteği</div>
            <div class="text">
                Repathly hesabınız için şifre sıfırlama talebinde bulundunuz.
                Aşağıdaki kodu uygulamada ilgili alana girin:
            </div>

            <div class="token-box">
                <div class="token">{{ $token }}</div>
                <div class="token-label">Şifre Sıfırlama Kodu (60 dakika geçerli)</div>
            </div>

            <div class="warning">
                ⚠️ Bu isteği siz yapmadıysanız bu emaili görmezden gelin. Hesabınız güvende, şifreniz değiştirilmedi.
            </div>
        </div>
        <div class="footer">
            Bu email <strong>{{ $email }}</strong> adresine gönderildi.<br>
            © {{ date('Y') }} Repathly — Tüm hakları saklıdır.
        </div>
    </div>
</body>
</html>
