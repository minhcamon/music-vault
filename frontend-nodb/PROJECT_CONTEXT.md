# Context Dự Án - MusicVault Frontend (NoDB)

## 📌 1. Tổng quan dự án
**`frontend-nodb`** (**MusicVault**) là ứng dụng trình phát nhạc web client-side (Music Player / Music Vault) chạy **100% trên trình duyệt**, hoạt động hoàn toàn độc lập mà **không cần server backend hoặc cơ sở dữ liệu riêng**.

Người dùng có thể kết nối các nguồn lưu trữ nhạc của mình (thư mục cục bộ trên máy tính, Google Drive, AWS S3,...). Ứng dụng tự động quét (scan), phân tích các thẻ metadata ID3/Vorbis (Tiêu đề, Nghệ sĩ, Album, Năm phát hành, Định dạng, Bitrate, Sample rate, Cover Art Blob), tự động phân loại thành Album & Nghệ sĩ, và lưu trữ dữ liệu thư viện trực tiếp vào **IndexedDB** của trình duyệt.

---

## 🛠️ 2. Công nghệ sử dụng (Tech Stack)
* **Core Framework**: React 19 + TypeScript + Vite.
* **Styling**: Tailwind CSS + Glassmorphism UI (phong cách Apple Music Ambient Glow).
* **UI Components**: `@radix-ui` (Slider, Dialog, Dropdown Menu, Tabs, Tooltip, Progress) + `lucide-react` (Icons).
* **Client Database**: **Dexie.js** (IndexedDB wrapper) + `dexie-react-hooks` (`useLiveQuery`).
* **Audio Metadata Parser**: `music-metadata-browser` (Trích xuất thông tin audio & Cover Art từ file âm thanh).

---

## 📁 3. Cấu trúc thư mục & Mô tả các thành phần

```text
frontend-nodb/
├── src/
│   ├── assets/          # Tài nguyên tĩnh (images, icons)
│   ├── components/      # Giao diện người dùng
│   │   ├── common/      # Header, Sidebar, VinylRecord (đĩa than xoay)
│   │   ├── modals/      # AlbumDetailModal, SongDetailModal, SourceModal, ConfirmModal...
│   │   ├── player/      # PlayerDock (thanh phát nhạc), LiveQueueDrawer (hàng chờ)
│   │   └── ui/          # Các UI atomic components (slider, button, dialog...)
│   ├── contexts/        # React Contexts
│   │   ├── AudioContext.tsx    # Trạng thái & điều khiển HTML5 Audio Element
│   │   ├── LibraryContext.tsx  # Trạng thái thư viện & tiến trình quét nhạc
│   │   └── UIContext.tsx       # Trạng thái điều hướng View, Drawer & Modals
│   ├── db/              # IndexedDB Engine
│   │   ├── database.ts  # Schema 6 bảng Dexie (sources, songs, albums, artists, playlists, history)
│   │   └── indexer.ts   # Bộ quét thư viện & phân loại Album/Nghệ sĩ
│   ├── hooks/           # Custom React Hooks (useClickOutside...)
│   ├── providers/       # Adapter kết nối các nguồn lưu trữ
│   │   ├── base.provider.ts   # Base Storage Provider interface
│   │   ├── local.provider.ts  # Đọc file máy tính qua File System Access API
│   │   ├── gdrive.provider.ts # Đọc file từ Google Drive
│   │   ├── s3.provider.ts     # Đọc file từ AWS S3 / Compatible Cloud Storage
│   │   └── registry.ts        # Provider Registry Manager
│   ├── services/        # Các dịch vụ xử lý logic
│   │   ├── metadata.service.ts # Parse tag audio & cover art
│   │   └── fileRefRegistry.ts  # Bộ nhớ RAM lưu trữ File references cho streaming
│   ├── types/           # Định nghĩa TypeScript interfaces (Song, Album, Artist, StorageSource...)
│   └── views/           # Các màn hình chính (SongsView, AlbumsView, ArtistsView, SourcesView)
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔄 4. Luồng hoạt động chính (Core Workflows)

### 4.1. Kết nối & Quét nguồn nhạc (Indexing & Scanning Workflow)
1. **Thêm nguồn lưu trữ**: Người dùng thêm một nguồn nhạc mới (Local Folder, Google Drive, S3) trong `SourcesView`.
2. **Liệt kê file**: `LibraryIndexer.scanSource()` gọi Provider tương ứng để quét danh sách các file audio.
3. **Phân tích Metadata**: `MetadataService.parseBlobOrFile()` phân tích thẻ metadata ID3/Vorbis (MP3, FLAC, WAV...).
4. **Trích xuất Cover Art**: Ảnh bìa bài hát được trích xuất dưới dạng Blob URL.
5. **Ghi dữ liệu Atomic**: `indexer.ts` nhóm các bài hát thành `Albums` và `Artists`, sau đó thực hiện ghi đồng thời (Atomic Batch Transaction) vào Dexie IndexedDB.

### 4.2. Stream & Phát nhạc (Audio Streaming & Playback Workflow)
1. **Lấy File Reference**: Khi phát bài hát, ứng dụng lấy File Reference từ `FileRefRegistry` (hoặc khởi tạo URL phát trực tiếp từ Provider).
2. **Phát nhạc**: `AudioContext` nạp URL/Blob URL vào đối tượng HTML5 Audio.
3. **Quản lý Hàng chờ & Lịch sử**: Cập nhật danh sách bài hát đang phát (`queue`), tự động ghi nhận bài hát vào bảng `history` trong IndexedDB khi nghe.

---

## 🚀 5. Hướng dẫn chạy dự án

### Cài đặt dependencies:
```bash
npm install
```

### Chạy ở môi trường Development:
```bash
npm run dev
```

### Build cho Production:
```bash
npm run build
```

### Linting:
```bash
npm run lint
```
