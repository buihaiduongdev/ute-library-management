# Tổng Quan Công Nghệ Nâng Cấp - Dành Cho Team

> **Mục đích**: Giải thích các công nghệ mới cho đề tài sắp tới, giúp team hiểu **TẠI SAO** và **NHƯ THẾ NÀO** sử dụng.

---

## 🎯 Tổng Quan: Từ Cũ Sang Mới

| Khía Cạnh | Công Nghệ Cũ | Công Nghệ Mới | Lợi Ích |
|-----------|--------------|---------------|---------|
| **Ngôn ngữ** | JavaScript | TypeScript | Phát hiện lỗi khi code, không phải khi chạy |
| **Data Fetching** | useState + useEffect | TanStack Query | Tự động cache, loading, error handling |
| **Validation** | Validate riêng FE/BE | Zod (shared) | Một schema dùng chung, đồng bộ 100% |
| **Styling** | CSS thuần/SASS | Tailwind CSS | Nhanh hơn, dễ maintain, responsive tự động |
| **Database** | MSSQL | PostgreSQL | Open-source, phổ biến, nhiều tài liệu |

---

## 1️⃣ TypeScript - "JavaScript Có Kiểu Dữ Liệu"

### Vấn đề với JavaScript thuần

```javascript
// JavaScript - Lỗi chỉ phát hiện khi CHẠY
function calculateTotal(price, quantity) {
  return price * quantity;
}

calculateTotal("100", 5);  // ❌ Kết quả: "100100100100100" (string repeat)
// Lỗi này chỉ phát hiện khi user click vào button!
```

### Giải pháp với TypeScript

```typescript
// TypeScript - Lỗi phát hiện KHI CODE
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

calculateTotal("100", 5);  // ❌ VSCode gạch đỏ ngay: Type 'string' is not assignable to type 'number'
// Lỗi này phát hiện TRƯỚC KHI chạy!
```

### Lợi ích thực tế

✅ **Autocomplete thông minh**: VSCode gợi ý chính xác các thuộc tính  
✅ **Refactor an toàn**: Đổi tên biến/function tự động update toàn bộ  
✅ **Ít bug hơn**: Phát hiện lỗi sớm, trước khi deploy  
✅ **Teamwork tốt hơn**: Code tự document, dễ hiểu hơn

---

## 2️⃣ TanStack Query - "Quản Lý Data Fetching Tự Động"

### Vấn đề với useState + useEffect

```javascript
// Cách cũ - Phức tạp, nhiều boilerplate
function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []); // Phải nhớ dependencies

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{books.map(book => ...)}</div>;
}
```

**Vấn đề**:
- ❌ Phải tự quản lý loading, error states
- ❌ Không có caching → Fetch lại mỗi lần vào trang
- ❌ Không tự động refetch khi data cũ
- ❌ Code dài dòng, lặp lại nhiều

### Giải pháp với TanStack Query

```typescript
// Cách mới - Ngắn gọn, tự động
function BookList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: () => fetch('/api/books').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.map(book => ...)}</div>;
}
```

**Lợi ích**:
- ✅ **Tự động cache**: Lần 2 vào trang không fetch lại
- ✅ **Background refetch**: Tự động cập nhật data khi cũ
- ✅ **Optimistic updates**: UI update ngay, không chờ server
- ✅ **Deduplicate requests**: Nhiều component dùng chung 1 request

### Ví dụ thực tế: Caching

```typescript
// User vào trang "Danh sách sách"
<BookList />  // → Fetch data từ server (1 request)

// User chuyển sang trang khác, sau đó quay lại
<BookList />  // → Không fetch! Dùng cache (0 request)

// Sau 5 phút (staleTime hết hạn)
<BookList />  // → Background refetch, UI vẫn hiển thị data cũ
```

---

## 3️⃣ Zod - "Validation Schema Dùng Chung"

### Vấn đề: Validation Không Đồng Bộ

```javascript
// Backend validation (Express)
app.post('/api/books', (req, res) => {
  if (!req.body.TieuDe || req.body.TieuDe.length > 255) {
    return res.status(400).json({ error: 'Tiêu đề không hợp lệ' });
  }
  // ...
});

// Frontend validation (React)
const handleSubmit = (values) => {
  if (!values.TieuDe || values.TieuDe.length > 255) {
    setError('Tiêu đề không hợp lệ');
    return;
  }
  // ...
};
```

**Vấn đề**:
- ❌ Code lặp lại 2 lần (FE + BE)
- ❌ Dễ quên sync khi thay đổi (FE cho phép 255 ký tự, BE chỉ cho 100)
- ❌ Khó maintain khi có nhiều fields

### Giải pháp với Zod

**File shared: `schemas/book.schema.ts`** (Dùng chung FE + BE)

```typescript
import { z } from 'zod';

export const CreateBookSchema = z.object({
  TieuDe: z.string()
    .min(1, 'Tiêu đề là bắt buộc')
    .max(255, 'Tiêu đề tối đa 255 ký tự'),
  TenTacGia: z.string().min(1, 'Tác giả là bắt buộc'),
  SoLuong: z.number().int().nonnegative('Số lượng phải >= 0'),
  GiaSach: z.number().nonnegative('Giá sách phải >= 0'),
});

// Tự động generate TypeScript type
export type CreateBookInput = z.infer<typeof CreateBookSchema>;
```

**Backend sử dụng**:

```typescript
import { CreateBookSchema } from '@shared/schemas/book.schema';

app.post('/api/books', (req, res) => {
  const result = CreateBookSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  
  const validData = result.data; // Type-safe!
  // ...
});
```

**Frontend sử dụng** (với react-hook-form):

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookSchema } from '@shared/schemas/book.schema';

function BookForm() {
  const form = useForm({
    resolver: zodResolver(CreateBookSchema), // Tự động validate!
  });

  const onSubmit = (data) => {
    // data đã được validate, type-safe!
    console.log(data.TieuDe); // ✅ TypeScript biết TieuDe là string
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**Lợi ích**:
- ✅ **Single source of truth**: Chỉ định nghĩa 1 lần
- ✅ **Tự động sync**: FE và BE luôn giống nhau
- ✅ **Type-safe**: TypeScript types tự động generate
- ✅ **Error messages nhất quán**: Cùng 1 message ở FE và BE

### Kịch bản thực tế: Thay đổi validation

```typescript
// Developer A thay đổi schema
export const CreateBookSchema = z.object({
  TieuDe: z.string().min(1).max(100), // Thay đổi từ 255 → 100
});

// Frontend tự động báo lỗi khi build
const longTitle = 'A'.repeat(200);
form.setValue('TieuDe', longTitle); // ❌ TypeScript error!

// Backend cũng tự động validate
// → Không thể có trường hợp FE cho phép 255 nhưng BE chỉ cho 100!
```

---

## 4️⃣ Tailwind CSS - "Utility-First CSS"

### Vấn đề với CSS thuần

```css
/* styles.css */
.book-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.book-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .book-card {
    padding: 12px;
  }
}
```

```jsx
// Component
<div className="book-card">...</div>
```

**Vấn đề**:
- ❌ Phải đặt tên class (book-card, book-card-title, ...)
- ❌ Phải nhảy qua lại giữa JSX và CSS file
- ❌ CSS không được dùng → Dead code
- ❌ Khó responsive (phải viết media queries thủ công)

### Giải pháp với Tailwind

```jsx
// Không cần CSS file riêng!
<div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg md:p-3">
  ...
</div>
```

**Giải thích**:
- `bg-white` → background-color: white
- `rounded-lg` → border-radius: 8px
- `p-4` → padding: 16px
- `shadow-md` → box-shadow (medium)
- `hover:shadow-lg` → hover state
- `md:p-3` → padding: 12px trên màn hình medium (≥768px)

**Lợi ích**:
- ✅ **Nhanh hơn**: Không cần đặt tên class, không cần chuyển file
- ✅ **Responsive dễ dàng**: `sm:`, `md:`, `lg:` prefixes
- ✅ **Không có dead CSS**: Chỉ build CSS thực sự dùng
- ✅ **Consistent design**: Spacing, colors theo design system

### Ví dụ thực tế: Button component

```jsx
// Trước: CSS thuần
<button className="btn btn-primary">Click me</button>

/* CSS file */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}
.btn-primary {
  background-color: #0077b6;
  color: white;
}
.btn-primary:hover {
  background-color: #005a8d;
}

// Sau: Tailwind
<button className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">
  Click me
</button>
```

---

## 5️⃣ PostgreSQL - "Database Hiện Đại & Phổ Biến"

### Tại sao chuyển từ MSSQL sang PostgreSQL?

| Tiêu chí | MSSQL | PostgreSQL |
|----------|-------|------------|
| **License** | Trả phí (SQL Server) | Miễn phí, open-source |
| **Cộng đồng** | Nhỏ hơn | Rất lớn, nhiều tài liệu |
| **Hosting** | Ít lựa chọn, đắt | Nhiều lựa chọn (Heroku, Railway, Supabase) |
| **JSON support** | Hạn chế | Rất tốt (JSONB) |
| **Extensions** | Ít | Rất nhiều (PostGIS, pg_vector, ...) |

### Ví dụ Migration với Prisma

**Trước (MSSQL)**:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model Sach {
  MaSach     Int    @id @default(autoincrement())
  TieuDe     String @db.VarChar(255)
  SoLuong    Int    @db.TinyInt
}
```

**Sau (PostgreSQL)**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Sach {
  MaSach     Int    @id @default(autoincrement())
  TieuDe     String @db.VarChar(255)
  SoLuong    Int    @db.SmallInt  // PostgreSQL không có TinyInt
}
```

**Lợi ích**:
- ✅ Deploy miễn phí (Supabase, Railway)
- ✅ Nhiều tài liệu học tập
- ✅ Dễ tìm giải pháp khi gặp lỗi (Stack Overflow)

---

## 🔄 Luồng Dữ Liệu Mới (End-to-End Type Safety)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Database (PostgreSQL)                                   │
│     ↓ Prisma Schema                                         │
│  2. Prisma Client (Auto-generated TypeScript types)         │
│     ↓                                                        │
│  3. Zod Schemas (Validation + TypeScript types)             │
│     ├─→ Backend: Validate API input                         │
│     └─→ Frontend: Validate form input                       │
│     ↓                                                        │
│  4. TanStack Query (Type-safe data fetching)                │
│     ↓                                                        │
│  5. React Components (Type-safe props & state)              │
└─────────────────────────────────────────────────────────────┘
```

### Ví dụ cụ thể: Thêm sách mới

**1. Database → Prisma Types**

```prisma
model Sach {
  MaSach  Int    @id @default(autoincrement())
  TieuDe  String @db.VarChar(255)
  SoLuong Int
}
```

→ Prisma tự động generate type `Sach`

**2. Zod Schema**

```typescript
export const CreateBookSchema = z.object({
  TieuDe: z.string().max(255),
  SoLuong: z.number().int().nonnegative(),
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
```

**3. Backend API**

```typescript
app.post('/api/books', validate(CreateBookSchema), async (req, res) => {
  const data: CreateBookInput = req.body; // ✅ Type-safe
  
  const book = await prisma.sach.create({
    data: {
      TieuDe: data.TieuDe,
      SoLuong: data.SoLuong,
    },
  });
  
  res.json({ data: book }); // ✅ Type: Sach
});
```

**4. Frontend Hook**

```typescript
export const useCreateBook = () => {
  return useMutation({
    mutationFn: (data: CreateBookInput) => { // ✅ Type-safe input
      return apiClient.post<{ data: Sach }>('/books', data);
    },
  });
};
```

**5. React Component**

```typescript
function BookForm() {
  const createBook = useCreateBook();
  
  const handleSubmit = (values: CreateBookInput) => { // ✅ Type-safe
    createBook.mutate(values, {
      onSuccess: (response) => {
        console.log(response.data.TieuDe); // ✅ TypeScript biết TieuDe tồn tại
      },
    });
  };
}
```

**Kết quả**: Nếu bạn thay đổi `TieuDe` thành `Title` ở database, **toàn bộ** code sẽ báo lỗi TypeScript!

