# AI-Powered Road Trip Experience Application – MVP (Phase 1)


### 1.1 Purpose
Bu mobil uygulamanın amacı, kara yoluyla seyahat eden kullanıcıların yapay zeka destekli önerilerle rotalarını planlamalarını, ilgi alanlarına göre filtrelemelerini ve yolculuk deneyimlerini paylaşmalarını sağlamaktır.

### 1.2 Scope
- Kullanıcı hesabı oluşturma ve gizlilik ayarları
- Başlangıç, bitiş ve ara noktalarla rota planlama
- İlgi alanı ve kategori bazlı öneri sistemi
- Önerilen yerleri ön program listesine ekleme
- Seyahat sırasında konum takibi ve bildirimler
- Ziyaret sonrası değerlendirme, puanlama ve yorumlar

---

## 🧩 2. Overall Description

### 2.1 Product Perspective
- Platform: **iOS 15+**, **Android 11+**
- Harita ve Navigasyon API entegrasyonu
- AI tabanlı öneri algoritması
- Topluluk temelli yorum ve değerlendirme yapısı

### 2.2 Product Functions
- **Kullanıcı Hesabı ve Gizlilik:** Profil gizliliği ayarları (özel, takipçilere açık, herkese açık)
- **Rota Planlama:** Başlangıç/bitiş seçimi, ara duraklar, alternatif rotalar
- **Kategori Seçimi:** Yemek, tarih, sanat, macera, kültürel alanlar vb.
- **Öneri Listesi:** AI ile oluşturulmuş kişisel öneriler
- **Seyahat Takibi:** Konum bazlı hatırlatma, ziyaret tespiti, anket ve puanlama

### 2.3 User Classes
- **Casual Travellers** – Yılda birkaç kez seyahat edenler
- **Explorers** – Sık seyahat eden gezginler
- **Local Experience Seekers** – Bulunduğu bölgede yeni deneyim arayanlar

### 2.4 Operating Environment
- Gereksinimler: GPS, internet bağlantısı
- Harita servisleri: Google Maps / Mapbox (tercih edilebilir)

---

## ⚙️ 3. Functional Requirements

### FR1 – Kullanıcı Hesabı ve Gizlilik
- Kayıt (e-posta, telefon, sosyal medya)
- Profil görünürlüğü ayarları
- Seyahatlerin kullanıcı profiline işlenmesi

### FR2 – Rota Planlama
- Başlangıç ve bitiş noktalarının belirlenmesi
- Ara duraklar ekleme
- Alternatif rota önerileri sunulması

### FR3 – İlgi Alanı ve Kategori Seçimi
- İlgi alanı seçimi
- Her kategori için öneri derecelendirmesi

### FR4 – Önerilen Yerler Listesi
- AI ile öneri listesi üretimi
- Yerleri programa ekleme
- Bekleyen & geçmiş seyahat ayrımı

### FR5 – Seyahat Sırasında Takip ve Değerlendirme
- Yaklaşan yerler için bildirim
- Konum takibi ile ziyaret algılama
- Ziyaret sonrası anket & yorumlama
- Topluluk etkileşimi ve dinamik puanlama

---

## 🧪 4. Non-Functional Requirements

- **Performans:** Öneri listesi <3 saniyede yüklenmeli
- **Güvenlik:** HTTPS kullanımı, GDPR uyumluluğu
- **Kullanılabilirlik:** Basit, sezgisel ve kullanıcı dostu arayüz

---

## 🧭 5. Flow Diagram (Mermaid)

```mermaid
flowchart TD
    A[Kullanıcı Giriş / Kayıt] --> B[Rota Başlangıç & Bitiş Belirleme]
    B --> C[Opsiyonel Ara Nokta Ekleme]
    C --> D[Alternatif Rotalardan Birini Seçme]
    D --> E[İlgi Alanı / Kategori Seçimi]
    E --> F[Öneri Sayısı & Beğeni Yüzdesi Ayarlama]
    F --> G[AI ile Önerilen Liste Oluşturma]
    G --> H[Ön Programına Yer Ekleme]
    H --> I[Seyahat Başlatma]
    I --> J[Yaklaşan Noktalar için Bildirim]
    J --> K[Ziyaret Tespiti (GPS)]
    K --> L[Ziyaret Sonrası Anket & Puanlama]
    L --> M[Yorum Yayınlama ve Topluluk Etkileşimi]
    M --> N[Dinamik Puan Güncelleme]

```
