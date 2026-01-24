# Bài Học: Zod - Schema Validation cho TypeScript

> **Mục tiêu**: Hiểu và sử dụng Zod để validate dữ liệu trong dự án TypeScript

---

## 📚 Mục Lục

1. [Zod Là Gì?](#zod-là-gì)
2. [Cài Đặt](#cài-đặt)
3. [Cơ Bản](#cơ-bản)
4. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)
5. [Tính Năng Nâng Cao](#tính-năng-nâng-cao)
6. [Backend + Frontend Dùng Chung](#backend--frontend-dùng-chung)
7. [Bài Tập Thực Hành](#bài-tập-thực-hành)

---

## 🔰 Zod Là Gì?

**Zod = Công cụ để mô tả "dữ liệu phải như thế nào"**

Giống như bạn nói với máy tính:
- "Tên phải là chữ, không được để trống"
- "Tuổi phải là số, từ 0 đến 150"
- "Email phải có dạng abc@gmail.com"

### Tại Sao Cần Zod?

**Vấn đề với JavaScript thuần**:
```javascript
// Không biết user sẽ gửi gì lên server
function createUser(data) {
  // data.email có thể là: string, number, undefined, null, object, ...
  // Phải tự viết validation thủ công
  if (!data.email || typeof data.email !== 'string') {
    throw new Error('Email không hợp lệ');
  }
  if (!data.age || typeof data.age !== 'number' || data.age < 0) {
    throw new Error('Tuổi không hợp lệ');
  }
  // ... nhiều if-else khác
}
```

**Giải pháp với Zod**:
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().nonnegative(),
});

function createUser(data: unknown) {
  const validData = UserSchema.parse(data); // Tự động validate!
  // validData đã được đảm bảo đúng format
}
```

---

## 📦 Cài Đặt

```bash
npm install zod
```

Với TypeScript:
```bash
npm install -D typescript
```

---

## 🎯 Cơ Bản

### 1. Kiểm Tra Kiểu Dữ Liệu Đơn Giản

```typescript
import { z } from 'zod';

// String
const nameSchema = z.string();
nameSchema.parse("John");        // ✅ OK
nameSchema.parse(123);            // ❌ Error: Expected string, received number

// Number
const ageSchema = z.number();
ageSchema.parse(25);              // ✅ OK
ageSchema.parse("25");            // ❌ Error: Expected number, received string

// Boolean
const isActiveSchema = z.boolean();
isActiveSchema.parse(true);       // ✅ OK
isActiveSchema.parse("true");     // ❌ Error: Expected boolean, received string
```

### 2. Thêm Điều Kiện (Constraints)

```typescript
// String với điều kiện
const usernameSchema = z.string()
  .min(3, "Username phải có ít nhất 3 ký tự")
  .max(20, "Username tối đa 20 ký tự")
  .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và _");

usernameSchema.parse("ab");           // ❌ Quá ngắn
usernameSchema.parse("john_doe");     // ✅ OK
usernameSchema.parse("john-doe");     // ❌ Có ký tự không hợp lệ (-)

// Number với điều kiện
const priceSchema = z.number()
  .int("Giá phải là số nguyên")
  .positive("Giá phải > 0")
  .max(1000000, "Giá tối đa 1 triệu");

priceSchema.parse(50000);         // ✅ OK
priceSchema.parse(50000.5);       // ❌ Không phải số nguyên
priceSchema.parse(-100);          // ❌ Không phải số dương
```

### 3. Object Schema

```typescript
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

// ✅ Hợp lệ
UserSchema.parse({
  name: "John Doe",
  email: "john@gmail.com",
  age: 25,
});

// ❌ Không hợp lệ
UserSchema.parse({
  name: "",                    // Quá ngắn
  email: "invalid-email",      // Không phải email
  age: -5,                     // Âm
});
```

### 4. Parse vs SafeParse

```typescript
const schema = z.string();

// parse() - Throw error nếu không hợp lệ
try {
  const result = schema.parse(123);
} catch (error) {
  console.log("Lỗi:", error);
}

// safeParse() - Trả về object { success, data/error }
const result = schema.safeParse(123);

if (result.success) {
  console.log("Dữ liệu hợp lệ:", result.data);
} else {
  console.log("Lỗi:", result.error.errors);
}
```

---

## 🌟 Ví Dụ Thực Tế

### Form Đăng Ký User

```typescript
import { z } from 'zod';

const RegisterSchema = z.object({
  // Username: 3-20 ký tự, chỉ chữ, số, _
  username: z.string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(20, "Username tối đa 20 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ, số và _"),
  
  // Email: phải đúng format
  email: z.string()
    .email("Email không hợp lệ"),
  
  // Password: ít nhất 6 ký tự
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  
  // Confirm password: phải giống password
  confirmPassword: z.string(),
  
  // Tuổi: 13-100
  age: z.number()
    .int()
    .min(13, "Phải từ 13 tuổi trở lên")
    .max(100, "Tuổi không hợp lệ"),
  
  // Đồng ý điều khoản
  agreeToTerms: z.boolean()
    .refine(val => val === true, "Bạn phải đồng ý điều khoản"),
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  }
);

// Sử dụng
const formData = {
  username: "john_doe",
  email: "john@gmail.com",
  password: "password123",
  confirmPassword: "password123",
  age: 25,
  agreeToTerms: true,
};

const result = RegisterSchema.safeParse(formData);

if (result.success) {
  console.log("Đăng ký thành công:", result.data);
} else {
  console.log("Lỗi:", result.error.errors);
}
```

### API Endpoint Validation

```typescript
// Backend (Express)
import { z } from 'zod';

const CreateBookSchema = z.object({
  TieuDe: z.string().min(1).max(255),
  TenTacGia: z.string().min(1),
  SoLuong: z.number().int().nonnegative(),
  GiaSach: z.number().nonnegative(),
  TheLoai: z.string().optional(),
});

app.post('/api/books', (req, res) => {
  // Validate request body
  const result = CreateBookSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  
  // Dữ liệu đã được validate
  const bookData = result.data;
  
  // Lưu vào database
  const book = await prisma.sach.create({ data: bookData });
  
  res.json({ data: book });
});
```

---

## 🚀 Tính Năng Nâng Cao

### 1. Optional vs Nullable

```typescript
const schema = z.object({
  name: z.string(),                    // Bắt buộc
  age: z.number().optional(),          // Có thể không có (undefined)
  email: z.string().nullable(),        // Có thể là null
  phone: z.string().optional().nullable(), // Có thể undefined HOẶC null
});

// ✅ Tất cả đều hợp lệ
schema.parse({ name: "John" });
schema.parse({ name: "John", age: 25 });
schema.parse({ name: "John", email: null });
schema.parse({ name: "John", phone: undefined });
```

### 2. Default Values

```typescript
const UserSchema = z.object({
  name: z.string(),
  role: z.string().default("user"),      // Mặc định là "user"
  isActive: z.boolean().default(true),   // Mặc định là true
});

const result = UserSchema.parse({ name: "John" });
console.log(result);
// { name: "John", role: "user", isActive: true }
```

### 3. Transform (Chuyển Đổi Dữ Liệu)

```typescript
// Chuyển string thành uppercase
const upperCaseSchema = z.string().transform(val => val.toUpperCase());
upperCaseSchema.parse("hello"); // "HELLO"

// Chuyển string thành Date
const dateSchema = z.string().transform(val => new Date(val));
dateSchema.parse("2024-01-24"); // Date object

// Trim whitespace
const trimmedSchema = z.string().transform(val => val.trim());
trimmedSchema.parse("  hello  "); // "hello"
```

### 4. Refine (Custom Validation)

```typescript
// Password phải có ít nhất 1 chữ hoa và 1 số
const passwordSchema = z.string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .refine(
    val => /[A-Z]/.test(val),
    "Mật khẩu phải có ít nhất 1 chữ hoa"
  )
  .refine(
    val => /[0-9]/.test(val),
    "Mật khẩu phải có ít nhất 1 số"
  );

passwordSchema.parse("password");     // ❌ Không có chữ hoa
passwordSchema.parse("Password");     // ❌ Không có số
passwordSchema.parse("Password123");  // ✅ OK
```

### 5. Enum (Giá Trị Cố Định)

```typescript
// Chỉ cho phép "admin", "user", hoặc "guest"
const roleSchema = z.enum(["admin", "user", "guest"]);

roleSchema.parse("admin");  // ✅ OK
roleSchema.parse("user");   // ✅ OK
roleSchema.parse("hacker"); // ❌ Error

// Với TypeScript
type Role = z.infer<typeof roleSchema>;
// type Role = "admin" | "user" | "guest"
```

### 6. Array

```typescript
// Array of strings
const tagsSchema = z.array(z.string());
tagsSchema.parse(["tag1", "tag2"]);     // ✅ OK
tagsSchema.parse(["tag1", 123]);        // ❌ Error

// Array với điều kiện
const numbersSchema = z.array(z.number())
  .min(1, "Phải có ít nhất 1 phần tử")
  .max(10, "Tối đa 10 phần tử");

numbersSchema.parse([]);                // ❌ Quá ít
numbersSchema.parse([1, 2, 3]);         // ✅ OK
```

### 7. Union (Hoặc/Hoặc)

```typescript
// Giá trị có thể là string HOẶC number
const idSchema = z.union([z.string(), z.number()]);

idSchema.parse("123");   // ✅ OK
idSchema.parse(123);     // ✅ OK
idSchema.parse(true);    // ❌ Error
```

---

## 🔗 Backend + Frontend Dùng Chung

### Cấu Trúc Thư Mục

```
project/
├── shared/
│   └── schemas/
│       ├── book.schema.ts
│       ├── auth.schema.ts
│       └── index.ts
├── server/
│   └── src/
│       └── controllers/
├── client/
│   └── src/
│       └── components/
```

### File Shared: `shared/schemas/book.schema.ts`

```typescript
import { z } from 'zod';

export const CreateBookSchema = z.object({
  TieuDe: z.string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  
  TenTacGia: z.string()
    .min(1, "Tên tác giả không được để trống"),
  
  SoLuong: z.number()
    .int("Số lượng phải là số nguyên")
    .nonnegative("Số lượng không được âm"),
  
  GiaSach: z.number()
    .nonnegative("Giá sách không được âm"),
  
  TheLoai: z.string().optional(),
  
  AnhBia: z.string()
    .regex(/^data:image\//, "Ảnh bìa phải là base64")
    .nullable()
    .optional(),
});

// Tự động generate TypeScript type
export type CreateBookInput = z.infer<typeof CreateBookSchema>;
```

### Backend Sử Dụng

```typescript
import { CreateBookSchema, CreateBookInput } from '@shared/schemas/book.schema';

app.post('/api/books', (req, res) => {
  const result = CreateBookSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: result.error.errors,
    });
  }
  
  const bookData: CreateBookInput = result.data;
  // Lưu vào database...
});
```

### Frontend Sử Dụng (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookSchema, CreateBookInput } from '@shared/schemas/book.schema';

function BookForm() {
  const form = useForm<CreateBookInput>({
    resolver: zodResolver(CreateBookSchema),
  });

  const onSubmit = (data: CreateBookInput) => {
    // data đã được validate
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('TieuDe')} />
      {form.formState.errors.TieuDe && (
        <p className="error">{form.formState.errors.TieuDe.message}</p>
      )}
      
      <input 
        type="number" 
        {...form.register('SoLuong', { valueAsNumber: true })} 
      />
      {form.formState.errors.SoLuong && (
        <p className="error">{form.formState.errors.SoLuong.message}</p>
      )}
      
      <button type="submit">Thêm sách</button>
    </form>
  );
}
```

**Lợi ích**:
- ✅ Chỉ định nghĩa schema 1 lần
- ✅ Frontend và Backend luôn đồng bộ
- ✅ Thay đổi validation → cả 2 bên tự động update
- ✅ TypeScript types tự động generate

---

## 📚 Tài Liệu Tham Khảo

- [Zod Official Docs](https://zod.dev/) - Documentation chính thức
- [Zod GitHub](https://github.com/colinhacks/zod) - Source code và examples
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation) - Integration guide

---

## 💡 Tóm Tắt

### Khi Nào Dùng Zod?

✅ **Nên dùng**:
- Validate API input (Backend)
- Validate form input (Frontend)
- Parse dữ liệu từ external sources
- Muốn type safety với TypeScript

❌ **Không cần**:
- Dữ liệu đã được validate
- Performance critical code

### Các Method Quan Trọng

| Method | Mô Tả | Ví Dụ |
|--------|-------|-------|
| `.parse()` | Validate, throw error nếu sai | `schema.parse(data)` |
| `.safeParse()` | Validate, return object | `schema.safeParse(data)` |
| `.min()` | Giá trị tối thiểu | `z.string().min(3)` |
| `.max()` | Giá trị tối đa | `z.string().max(20)` |
| `.optional()` | Có thể undefined | `z.string().optional()` |
| `.nullable()` | Có thể null | `z.string().nullable()` |
| `.default()` | Giá trị mặc định | `z.string().default("user")` |
| `.transform()` | Chuyển đổi dữ liệu | `z.string().transform(s => s.toUpperCase())` |
| `.refine()` | Custom validation | `z.string().refine(s => s.length > 0)` |

---

**Chúc bạn học tốt! 🚀**
