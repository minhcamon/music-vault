# Software Requirements Specification (SRS)
## Self-hosted Lossless Music Server

**Phiên bản:** 1.0
**Ngày:** 31/07/2026
**Trạng thái:** Draft — chuẩn bị cho thiết kế Database

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này mô tả yêu cầu chức năng và phi chức năng của hệ thống **Music Server tự host**, phục vụ mục đích lưu trữ, quản lý và phát nhạc lossless (FLAC, WAV) từ các thư mục cục bộ trên máy/NAS, truy cập qua trình duyệt trong mạng LAN (và có thể mở rộng ra ngoài qua VPN/reverse proxy sau này).

### 1.2 Phạm vi
Hệ thống bao gồm:
- Backend API quét, index, lưu metadata nhạc và stream file qua HTTP Range.
- Frontend web để duyệt thư viện, phát nhạc, quản lý playlist.
- Cơ chế quản lý nhiều **nguồn nhạc (source)** — tức nhiều thư mục gốc khác nhau trên máy.

Không thuộc phạm vi bản v1.0: transcoding real-time, đồng bộ multi-room, mobile app riêng, chia sẻ công khai ra internet không qua VPN.

### 1.3 Đối tượng sử dụng tài liệu
Dùng làm cơ sở để thiết kế database (ERD, schema Prisma), thiết kế API, và làm checklist khi phát triển.

### 1.4 Định nghĩa
| Thuật ngữ | Ý nghĩa |
|---|---|
| Source | Một thư mục gốc trên máy được người dùng thêm vào để quét nhạc |
| Track/Song | Một bản ghi nhạc (file) đã được index |
| Scan | Quá trình quét thư mục, đọc metadata, ghi vào DB |
| Orphan/Missing | Bản ghi trong DB nhưng file vật lý không còn tồn tại |
| Library | Toàn bộ tập hợp bài hát từ tất cả các source đang bật |

---

## 2. Mô tả tổng quan

### 2.1 Bối cảnh sản phẩm
Ứng dụng chạy dạng self-hosted qua Docker Compose (frontend + backend + volume nhạc), người dùng truy cập qua trình duyệt trong LAN. Không phụ thuộc cloud, không cần internet để hoạt động (trừ khi cần tải cover art ngoài).

### 2.2 Đối tượng người dùng
- **Admin** (chủ hệ thống): thêm/xóa source, cấu hình, quản lý user, xem log scan.
- **User** thường: duyệt thư viện, phát nhạc, tạo playlist cá nhân, tìm kiếm.

> Ghi chú: v1.0 có thể chỉ có 1 user duy nhất (admin = user), nhưng schema nên chừa chỗ cho multi-user vì đây là điểm khác biệt chính giữa SQLite/Postgres trước đó.

### 2.3 Ràng buộc thiết kế
- Database: **SQLite** (giai đoạn đầu), thiết kế qua Prisma để dễ migrate sang PostgreSQL sau.
- Không sửa/xóa file gốc trên đĩa — hệ thống chỉ đọc (read-only đối với thư mục nhạc).
- Phải chịu được thư viện lớn (hàng chục nghìn bài) mà không treo khi scan.
- Hỗ trợ nhiều định dạng: FLAC, WAV, MP3, ALAC (tối thiểu FLAC/WAV/MP3 cho v1.0).

### 2.4 Giả định & phụ thuộc
- Thư mục nhạc được mount vào container dưới dạng volume, đường dẫn bên trong container ổn định.
- Metadata tag trong file (ID3/Vorbis Comment) được coi là nguồn sự thật chính; nếu thiếu tag thì fallback theo tên file/thư mục.

---

## 3. Yêu cầu chức năng

### 3.1 Quản lý Source (nguồn nhạc)
| ID | Yêu cầu |
|---|---|
| FR-01 | Người dùng (admin) có thể **thêm một source mới** bằng cách nhập đường dẫn thư mục trên máy + tên hiển thị |
| FR-02 | Hệ thống validate đường dẫn tồn tại và có quyền đọc trước khi lưu |
| FR-03 | Người dùng có thể **bật/tắt (enable/disable)** một source mà không xóa dữ liệu đã quét |
| FR-04 | Người dùng có thể **xóa hẳn** một source, kèm tùy chọn xóa toàn bộ bài hát thuộc source đó khỏi DB |
| FR-05 | Người dùng có thể **đổi tên hiển thị** của source |
| FR-06 | Hệ thống hiển thị trạng thái mỗi source: số bài hát, dung lượng, lần quét cuối, số bài lỗi/missing |
| FR-07 | Hỗ trợ nhiều source cùng lúc, không giới hạn số lượng cố định |

### 3.2 Quét & Index thư viện
| ID | Yêu cầu |
|---|---|
| FR-10 | Hệ thống quét toàn bộ (full scan) một source theo yêu cầu thủ công |
| FR-11 | Hệ thống tự động phát hiện thay đổi (file mới/xóa/sửa) qua watcher (chokidar) và cập nhật incremental, không cần full scan lại |
| FR-12 | Khi quét, hệ thống đọc metadata: title, artist, album, albumArtist, track/disc number, genre, năm, thời lượng, codec, bitrate, sample rate, bit depth |
| FR-13 | Nếu file thiếu tag, hệ thống suy ra title từ tên file, album từ tên thư mục cha |
| FR-14 | File không còn tồn tại khi quét lại → đánh dấu `missing`, không xóa record ngay |
| FR-15 | Trích xuất/cache ảnh bìa album (embedded hoặc file `cover.jpg` cùng thư mục) |
| FR-16 | Hệ thống chống trùng: 1 file (theo source + đường dẫn tương đối) chỉ có đúng 1 record |
| FR-17 | Hiển thị tiến trình quét (số file đã xử lý / tổng) qua API hoặc WebSocket |

### 3.3 Duyệt thư viện
| ID | Yêu cầu |
|---|---|
| FR-20 | Xem danh sách bài hát, lọc theo source, artist, album, genre |
| FR-21 | Xem danh sách album (nhóm theo Album + Artist), kèm ảnh bìa |
| FR-22 | Xem danh sách nghệ sĩ, số album/bài hát mỗi nghệ sĩ |
| FR-23 | Sắp xếp theo tên, năm phát hành, ngày thêm, thời lượng |
| FR-24 | Tìm kiếm full-text theo tên bài/album/nghệ sĩ |
| FR-25 | Phân trang cho danh sách lớn (không load toàn bộ 1 lần) |

### 3.4 Phát nhạc
| ID | Yêu cầu |
|---|---|
| FR-30 | Stream file qua HTTP với hỗ trợ **Range request** (tua nhạc không cần tải lại từ đầu) |
| FR-31 | Không transcode ở v1.0 — trả file gốc (giữ chất lượng lossless) |
| FR-32 | Ghi nhận lịch sử phát (playback history) cho mục đích thống kê "Recently played" |
| FR-33 | Đếm số lần phát mỗi bài (play count) |

### 3.5 Playlist
| ID | Yêu cầu |
|---|---|
| FR-40 | Tạo/xóa/đổi tên playlist |
| FR-41 | Thêm/xóa bài hát khỏi playlist, sắp xếp lại thứ tự |
| FR-42 | Một bài hát có thể thuộc nhiều playlist |

### 3.6 Người dùng & phân quyền (chuẩn bị cho multi-user)
| ID | Yêu cầu |
|---|---|
| FR-50 | Hệ thống có khái niệm User riêng biệt (kể cả khi v1.0 chỉ dùng 1 user) |
| FR-51 | Playlist, lịch sử phát, play count gắn với từng User |
| FR-52 | Source/scan là cấu hình toàn hệ thống (admin-level), không gắn theo user |

### 3.7 Quản trị & bảo trì
| ID | Yêu cầu |
|---|---|
| FR-60 | Xem log các lần scan (thời gian bắt đầu/kết thúc, số file mới/sửa/xóa, lỗi) |
| FR-61 | Chạy "dọn dẹp" thủ công: xóa hẳn các bài `missing` quá X ngày |

---

## 4. Yêu cầu phi chức năng

| ID | Loại | Yêu cầu |
|---|---|---|
| NFR-01 | Hiệu năng | Quét thư viện 10.000 bài phải hoàn thành trong thời gian hợp lý (chạy nền, không block API khác) |
| NFR-02 | Hiệu năng | API danh sách bài hát trả kết quả < 300ms với thư viện ≤ 50.000 bài (có phân trang + index DB) |
| NFR-03 | Độ tin cậy | Mất kết nối tới 1 source (ổ rời) không được làm crash toàn hệ thống |
| NFR-04 | Toàn vẹn dữ liệu | Không bao giờ ghi/sửa/xóa file gốc trên đĩa nhạc |
| NFR-05 | Khả năng mở rộng | Schema DB thiết kế qua ORM (Prisma) để migrate SQLite → PostgreSQL không cần viết lại logic |
| NFR-06 | Bảo trì | Code tách rõ layer: scanner, metadata parser, API, streaming |
| NFR-07 | Bảo mật | (Tối thiểu v1.0) giới hạn truy cập trong LAN; chuẩn bị chỗ cho auth (User.passwordHash) dù chưa bật |
| NFR-08 | Khả năng phục hồi | Nếu app crash giữa lúc scan, lần chạy lại không tạo dữ liệu trùng/hỏng |

---

## 5. Yêu cầu dữ liệu (làm nền cho DB Design)

### 5.1 Thực thể chính (Entities)
| Thực thể | Mô tả ngắn |
|---|---|
| **Source** | Thư mục gốc trên máy được quét |
| **Song** | Một bài hát/track đã index, gắn với 1 Source |
| **Artist** | Nghệ sĩ, chuẩn hóa riêng để tránh trùng lặp tên |
| **Album** | Album, gắn với 1 Artist (nullable nếu compilation) |
| **User** | Người dùng hệ thống |
| **Playlist** | Danh sách phát do User tạo |
| **PlaylistSong** | Bảng trung gian Playlist ↔ Song (nhiều-nhiều, có thứ tự) |
| **PlaybackHistory** | Lịch sử phát nhạc theo User |
| **ScanLog** | Lịch sử các lần quét, phục vụ FR-60 |

### 5.2 Quan hệ chính (tóm tắt cho ERD)
- `Source (1) — (N) Song`
- `Artist (1) — (N) Album`
- `Artist (1) — (N) Song`
- `Album (1) — (N) Song`
- `User (1) — (N) Playlist`
- `Playlist (N) — (N) Song` qua `PlaylistSong` (có thêm cột `position`)
- `User (1) — (N) PlaybackHistory (N) — (1) Song`
- `Source (1) — (N) ScanLog`

### 5.3 Ràng buộc dữ liệu quan trọng cần thể hiện trong DB
- `(sourceId, relativePath)` là **unique** trên `Song` (chống trùng — FR-16).
- `Song.missing` (boolean) — soft-delete khi mất file (FR-14).
- `Source.enabled` — bật/tắt không xóa (FR-03).
- `PlaylistSong.position` — giữ thứ tự bài trong playlist (FR-41).
- Metadata kỹ thuật (bitrate, sampleRate, bitDepth, codec, duration) là các field riêng trên `Song`, không gộp chung 1 cột JSON, để còn lọc/sort theo chất lượng sau này.

---

## 6. Định hướng thị giác (UI Design Direction)

> Mục này ghi lại quyết định thẩm mỹ đã chốt, làm căn cứ để không đổi hướng giữa chừng khi build UI.

### 6.1 Phong cách
**Glassmorphism (glass) + tối giản**, nền tối (dark). Ưu tiên độ trong/mờ có kiểm soát, hạn chế màu sắc rực rỡ để giữ cảm giác sang trọng, tối giản.

### 6.2 Bảng màu đã chốt

| Vai trò | Tên gọi | Giá trị | Ghi chú |
|---|---|---|---|
| Nền chính | Đá than đêm | `#15171C` | Không dùng đen tuyền — đủ tương phản để lớp kính nổi lên rõ |
| Bề mặt kính | Sương kính | `rgba(255,255,255,0.06)` + backdrop-blur | Card/panel — độ mờ thấp, tránh blur dày gây rối |
| Viền kính | Viền băng | `rgba(255,255,255,0.14)` | Bắt buộc có — thiếu viền sáng nhẹ này thì hiệu ứng kính mất tự nhiên |
| Accent chính | Tím lam ánh kim | `#7C86F5` | Nút play, seek bar active, trạng thái được chọn |
| Accent phụ | Đồng ánh sáng | `#D4A66A` | CHỈ dùng cho badge chất lượng lossless (FLAC/24bit/96kHz...), không dùng nơi khác |
| Text chính | Sương trắng | `#EDEFF3` | Không dùng trắng tuyệt đối |
| Text phụ | Xám khói | `#8A9099` | Label, timestamp, metadata phụ |

### 6.3 Nguyên tắc áp dụng
- Chỉ 1 accent chính bão hòa thấp (`#7C86F5`) — tránh nhiều màu rực chồng lên nhiều lớp trong suốt gây rối mắt.
- Accent phụ (`#D4A66A`) mã hóa thông tin thật (chỉ hiện khi có gì đáng khoe về chất lượng audio), không phải màu trang trí tự do.
- Viền kính 1px sáng nhẹ là chi tiết bắt buộc trên mọi bề mặt kính, không tùy chọn.

---

## 7. Yêu cầu giao diện ngoài (tóm tắt API cần có)

| Nhóm | Endpoint mẫu |
|---|---|
| Source | `POST /sources`, `GET /sources`, `PATCH /sources/:id`, `DELETE /sources/:id`, `POST /sources/:id/scan` |
| Song | `GET /songs`, `GET /songs/:id`, `GET /songs/:id/stream` |
| Album/Artist | `GET /albums`, `GET /albums/:id`, `GET /artists`, `GET /artists/:id` |
| Playlist | `POST /playlists`, `GET /playlists/:id`, `POST /playlists/:id/songs`, `DELETE /playlists/:id/songs/:songId` |
| Search | `GET /search?q=` |
| Scan status | `GET /sources/:id/scan-status` hoặc WebSocket `/ws/scan-progress` |

---

## 8. Bước tiếp theo

Tài liệu này đủ để tiến hành:
1. Vẽ **ERD** đầy đủ (bao gồm cả `User`, `Playlist`, `PlaylistSong`, `PlaybackHistory`, `ScanLog` — chưa có trong schema Prisma đã thiết kế trước đó).
2. Viết lại **schema Prisma đầy đủ** dựa trên mục 5.
3. Định nghĩa các **index DB** dựa trên NFR-02 (index theo `artistId`, `albumId`, `title`, và full-text search nếu SQLite FTS5 được dùng cho FR-24).