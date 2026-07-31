---
name: fullstack-orchestrate
description: Cấu trúc thư mục và quy ước code áp dụng nguyên tắc SOLID cho dự án fullstack TypeScript (backend Fastify/Express + Prisma, frontend React + Vite). Dùng skill này khi scaffold dự án mới, thêm module/feature mới, tổ chức thư mục backend/frontend, tách layer (route/controller/service/repository), hoặc review kiến trúc dự án.
---

# Fullstack Orchestrate (SOLID Architecture)

Skill này định nghĩa cách tổ chức thư mục và trách nhiệm từng file cho dự án fullstack TypeScript, đảm bảo mỗi module tuân theo 5 nguyên tắc SOLID.

## Khi nào dùng skill này

- Scaffold dự án mới (backend Fastify/Express + Prisma, hoặc frontend React + Vite).
- Thêm 1 module/feature mới vào dự án đã có — áp đúng pattern thư mục có sẵn.
- Review cấu trúc thư mục hoặc code hiện có, phát hiện vi phạm SOLID (VD: service import Prisma trực tiếp, component gọi `fetch` trực tiếp, 1 file đảm nhận quá nhiều trách nhiệm).

## Nguyên tắc cốt lõi (FE & BE)

1. **Chia theo domain/feature, không chia theo loại file.** Mỗi domain (VD `songs`, `player`, `sources`) chứa đầy đủ các layer tương ứng của nó.
2. **Composition root duy nhất.** Chỉ có 1 nơi (`container.ts` ở backend, `providers/` ở frontend) được phép khởi tạo implementation cụ thể (Prisma client, API client). Mọi nơi khác phụ thuộc vào abstraction.
3. **Public export qua `index.ts` (barrel file)**: Ẩn chi tiết nội bộ module, cấm import trực tiếp vào file nội bộ của module khác.
4. **Single Responsibility (Mỗi file 1 trách nhiệm)**: Tách biệt rõ ràng giữa validation, business logic, DB query, và UI rendering.

## Thư mục gốc Monorepo (Root Directory Layout)

Dự án fullstack được tổ chức dưới dạng **Monorepo** phân chia rõ ràng giữa Frontend và Backend ở cấp thư mục gốc:

```
root/
├── frontend/               # Mã nguồn Frontend (React + TypeScript + Vite)
├── backend/                # Mã nguồn Backend (Fastify + TypeScript + Prisma)
├── .agent/skills/          # Thư mục lưu trữ các Agent Skills
├── SRS.md                  # Tài liệu Yêu cầu Phần mềm (Software Requirements Specification)
└── package.json            # Cấu hình scripts chung (chạy song song FE & BE)
```

## Backend Architecture: Fastify + TypeScript + Prisma

```
backend/src/
├── modules/<domain>/
│   ├── <domain>.routes.ts               # Định tuyến & validation (Zod) — KHÔNG chứa business logic
│   ├── <domain>.controller.ts            # Nhận request -> gọi service -> format response
│   ├── <domain>.service.ts               # Business logic, nhận repository qua constructor (KHÔNG import Prisma)
│   ├── <domain>.repository.ts            # Implementation chứa Prisma query thật
│   ├── <domain>.repository.interface.ts  # Abstraction interface cho service dùng
│   └── <domain>.schema.ts                # Zod schema input/output
├── shared/
│   ├── interfaces/                       # Generic interfaces (Repository<T>, Result<T>, PaginatedResponse<T>)
│   ├── errors/                           # Custom error classes
│   └── middlewares/
├── plugins/                              # Fastify plugins (CORS, error-handler)
├── lib/                                  # Prisma client, logger, config
├── container.ts                          # Composition Root — Nơi DUY NHẤT khởi tạo implementation cụ thể
└── server.ts
```

### Mapping SOLID (Backend)
| Nguyên tắc | Quy tắc áp dụng |
|---|---|
| **S** (Single Responsibility) | 1 file = 1 layer (route/controller/service/repository) trong 1 domain |
| **O** (Open/Closed) | Bọc thư viện ngoài (parser metadata, storage) trong 1 wrapper provider riêng |
| **L** (Liskov Substitution) | Mọi repository implement chung interface `Repository<T>` |
| **I** (Interface Segregation) | Mỗi domain định nghĩa interface repository riêng biệt, không dùng 1 interface DB dùng chung cho toàn bộ app |
| **D** (Dependency Inversion) | Service nhận repository qua constructor injection; chỉ `container.ts` được import implementation cụ thể |

### Quy tắc nghiêm cấm (Backend)
- Service import trực tiếp `prisma` client — phải thông qua repository interface.
- Route handler chứa business logic — chỉ validate và gọi controller.
- 1 file repository chứa query của nhiều domain khác nhau.

## Frontend Architecture: React + TypeScript + Vite

```
frontend/src/
├── features/<domain>/
│   ├── api/            # TanStack Query hooks — chỉ xử lý networking, KHÔNG chứa JSX
│   ├── components/     # UI components riêng cho feature
│   ├── hooks/           # Logic riêng feature (VD: useAudioPlayer)
│   ├── store.ts          # Zustand slice riêng (nếu có local/global client state)
│   ├── types.ts
│   └── index.ts           # Public export — ẩn các internal component/hook
├── shared/
│   ├── components/ui/     # Design system primitives (shadcn hoặc custom UI)
│   ├── components/         # Global shared UI: EmptyState, ErrorState...
│   ├── hooks/
│   └── lib/apiClient.ts
├── app/
│   ├── routes/
│   ├── providers/           # Composition Root: QueryClientProvider, ThemeProvider...
│   └── App.tsx
└── styles/tokens.css         # Design tokens / CSS variables
```

### Mapping SOLID (Frontend)
| Nguyên tắc | Quy tắc áp dụng |
|---|---|
| **S** (Single Responsibility) | Component chỉ render UI; Hook chỉ chứa logic; API Hook chỉ xử lý networking |
| **O** (Open/Closed) | Encapsulate logic dễ thay đổi (VD audio engine) trong hook riêng |
| **L** (Liskov Substitution) | Mọi component cùng loại nhận cùng shape props để dễ dàng hoán đổi |
| **I** (Interface Segregation) | `index.ts` của từng feature chỉ export những gì cần thiết cho bên ngoài |
| **D** (Dependency Inversion) | Component sử dụng custom hook (`useSourcesQuery`), không gọi `fetch`/`axios` trực tiếp trong component |

### Quy tắc nghiêm cấm (Frontend)
- Component gọi `fetch`/`axios` trực tiếp — phải qua custom hook trong `api/`.
- Import sâu vào file nội bộ của feature khác — chỉ import qua `index.ts` của feature đó.
- Trộn lẫn business logic (tính toán, transform data) trong JSX component — tách ra custom hook hoặc pure function.

## Quy trình khi thêm Module / Feature mới

1. Xác định `domain-name` (dạng số ít, kebab-case).
2. **Backend**: Tạo đủ 6 file chuẩn (`routes`, `controller`, `service`, `repository`, `repository.interface`, `schema`), đăng ký dependency trong `container.ts`.
3. **Frontend**: Tạo folder `features/<domain>/` chứa `api/`, `components/`, `types.ts`, `index.ts`. Chỉ thêm `hooks/` / `store.ts` khi thực sự cần thiết.
4. Không tự ý tạo file/folder lệch khỏi pattern chuẩn trên trừ khi có lý do kỹ thuật rõ ràng.
