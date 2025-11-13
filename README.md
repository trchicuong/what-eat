# 🍜 Hôm Nay Ăn Gì? - Game lật bài gợi ý món ăn

Ứng dụng web giúp bạn quyết định món ăn hàng ngày một cách thú vị thông qua trò chơi lật thẻ và push notifications. Viết bằng Vanilla JavaScript, build với Vite, lưu dữ liệu bằng Local Storage (không yêu cầu server backend - chỉ cần Netlify Functions cho push notifications).

> **[Xem Demo trực tiếp](https://eat.trchicuong.id.vn/)**

---

## 📥 Tải về

**1. Yêu cầu:**

- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên).

**2. Clone từ GitHub:**

```bash
git clone https://github.com/trchicuong/what-eat.git
cd what-eat
```

Hoặc tải file `.zip` trực tiếp từ repository.

---

## ⚙️ Cài đặt & Chạy

1.  **Cài đặt các gói phụ thuộc:**

    ```bash
    npm install
    ```

2.  **Chạy server phát triển:**

    ```bash
    npm run dev
    ```

3.  **Truy cập trình duyệt:**
    Mở `http://localhost:5173` (hoặc cổng khác do Vite cung cấp).

4.  **Build dự án:**

    ```bash
    npm run build
    ```

    Build output sẽ ở thư mục `dist/`

5.  **Deploy:**
    Netlify, Vercel, GitHub Pages,...

## 🔧 Environment Variables (Tùy chọn - Chỉ cho Push Notifications)

Nếu muốn sử dụng **Push Notifications**, tạo file `.env` trong root directory:

```env
# VAPID Keys (Required for Push Notifications)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VITE_VAPID_PRIVATE_KEY=your_vapid_private_key_here
VITE_VAPID_SUBJECT=mailto:your_email@example.com

# Netlify (Required for deployment with push)
NETLIFY_SITE_ID=your_site_id
NETLIFY_BLOBS_TOKEN=your_blobs_token
```

**Tạo VAPID Keys:**

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy keys vào `.env` file. **Lưu ý**: App vẫn hoạt động bình thường mà không cần push notifications.

## 📁 Cấu trúc thư mục

```
homnayangi/
├── public/
│   └── images/             # Logo, icons PWA
├── src/
│   ├── scripts/
│   │   └── app.js          # Main application logic
│   └── styles/
│       └── main.css        # All styles
├── netlify/
│   └── functions/
│       ├── subscribe.js          # Save push subscriptions
│       └── send-reminders.js     # Scheduled push sender
├── .gitignore
├── index.html
├── main.js                 # Vite entry point
├── package.json
├── vite.config.js          # Vite + PWA config
├── FEATURES.md             # Chi tiết tính năng
└── README.md
```

---

## 🤝 Đóng góp

Dự án này luôn chào đón các đóng góp! Nếu bạn muốn sửa lỗi, thêm tính năng mới, hoặc cải thiện mã nguồn, hãy thoải mái tạo một `Pull Request`.

---

## ✉️ Góp ý & Liên hệ

Nếu bạn có bất kỳ ý tưởng nào để cải thiện ứng dụng hoặc phát hiện lỗi, đừng ngần ngại mở một `Issue` trên repo này.

Mọi thông tin khác, bạn có thể liên hệ với tôi qua:
[**trchicuong.id.vn**](https://trchicuong.id.vn/)

---

**Made with ❤️ in Vietnam**
