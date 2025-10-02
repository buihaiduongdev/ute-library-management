# UTE Library Management
Hệ thống quản lý thư viện cho Đại học Sư phạm Kỹ thuật, gồm client (frontend) và server (backend).
[Cấu trúc thư mục](structure.txt)

## Yêu cầu
- Node.js >= 18
- npm >= 9
- SQL Server

## Cài đặt
```
git clone https://github.com/buihaiduongdev/ute-library-management
cd ute-library-management
npm install
cd server
npm install
cd..
```

## Cấu hình biến môi trường
Copy file `.env.example` trong folder `server` thành `.env`.
sửa lại cấu hình theo máy của bạn

## Chạy project
```
npm run dev
```
Backend Express chạy ở /server (port 3000)<br />
Frontend tĩnh chạy ở /client (port 8080)



