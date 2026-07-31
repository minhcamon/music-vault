# AudioVault Hi-Fi Music Server 🎧

Hệ thống **Self-Hosted Lossless Music Server** phục vụ lưu trữ, quét metadata và stream nhạc chất lượng cao (FLAC, WAV, MP3) qua giao diện trình duyệt Glassmorphism hiện đại.

---

## 🚀 Cấu trúc Monorepo

```
music-player/
├── frontend/     # Mã nguồn React + TypeScript + Vite + TailwindCSS
├── backend/      # Mã nguồn Fastify + TypeScript + Prisma (SQLite)
├── .agents/      # Agent Skills (fullstack-orchestrate)
├── package.json  # Scripts khởi chạy tập trung
└── SRS.md        # Tài liệu Yêu cầu Phần mềm
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt Dependencies (chỉ chạy lần đầu)

Mở terminal tại thư mục gốc của dự án (`music-player`):

```bash
# 1. Cài đặt package ở root
npm install

# 2. Cài đặt package cho Frontend
cd frontend && npm install && cd ..

# 3. Cài đặt package cho Backend & tạo SQLite Database
cd backend && npm install && npx prisma db push && cd ..
```

---

### 2. Khởi chạy dự án (Development Mode)

Chạy đồng thời cả **Frontend** và **Backend** với **1 lệnh duy nhất** tại thư mục gốc:

```bash
npm run dev
```

Hoặc bạn có thể chạy riêng từng thành phần:

- **Chạy riêng Frontend**:
  ```bash
  npm run dev:fe
  ```
  👉 Địa chỉ truy cập Frontend: `http://localhost:5173`

- **Chạy riêng Backend**:
  ```bash
  npm run dev:be
  ```
  👉 Địa chỉ Backend API: `http://localhost:3001/api`

---

## 📻 Các tính năng chính

1. **Quản lý Nguồn Nhạc (Music Source)**: Thêm thư mục nhạc local từ đĩa cứng hoặc NAS.
2. **Scanner Metadata**: Đọc thẻ ID3/Vorbis tag từ file FLAC/WAV/MP3, trích xuất ảnh bìa Album tự động.
3. **HTTP Range Audio Streaming**: Tua nhạc chất lượng cao FLAC/WAV tức thì mà không lag.
4. **Giao diện Glassmorphism Hi-Fi**: Thiết kế bề mặt kính hiện đại, bảng màu chuẩn Hi-Res.

---

## 🏗️ Kiểm tra Build (Production Build)

```bash
npm run build
```
Lệnh này sẽ kiểm tra TypeScript và build cả Frontend và Backend sẵn sàng để deploy.
