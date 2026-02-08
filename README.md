# Mini Trello - Trello Clone Application

Ứng dụng quản lý dự án theo kiểu Trello được xây dựng với **React + TypeScript** (Frontend) và **Node.js + Express** (Backend), sử dụng **Firebase** làm cơ sở dữ liệu và xác thực.

## Mục lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Tính Năng Chính](#tính-năng-chính)
3. [Setup Firebase](#setup-firebase)
4. [Setup GitHub OAuth](#setup-github-oauth)
5. [Cấu Hình Backend](#cấu-hình-backend)
6. [Cấu Hình Frontend](#cấu-hình-frontend)
7. [Cấu Trúc Project](#cấu-trúc-project)
8. [Cài Đặt & Chạy](#cài-đặt--chạy)

---

## Yêu Cầu Hệ Thống

- **Node.js**: v16+
- **npm** hoặc **yarn**
- **Firebase Project** (Firestore, Authentication)
- **GitHub OAuth Application**

---

## Tính Năng Chính

- **Xác thực Email**: Đăng ký/Đăng nhập bằng mã 6 chữ số
- **Quản lý Board**: Tạo, chỉnh sửa, xóa board dự án
- **Quản lý Card**: Thêm, chỉnh sửa, xóa card (danh sách công việc)
- **Quản lý Task**: Drag-and-drop tasks giữa các trạng thái (Icebox, Backlog, Ongoing, Review, Done)
- **Quản lý Thành Viên**: Mời thành viên vào board, chấp nhận/từ chối lời mời
- **Thông Báo Email**: Gửi email khi mời thành viên, xác thực
- **GitHub Integration**: Attach pull requests, commits, issues vào tasks
- **Giao Diện Responsive**: Hoạt động tốt trên desktop và mobile
- **Real-time Updates**: Cập nhật real-time qua WebSocket

---

## Setup Firebase

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Bấm **"Create Project"**
3. Nhập tên project: `minitrello` (hoặc tên tùy ý)
4. Chọn quốc gia, chấp nhận điều khoản, bấm **"Create"**
5. Chờ project được tạo xong

### Bước 2: Tạo Firestore Database

1. Trên trang Overview, bấm **"Create database"** (hoặc vào menu Firestore)
2. Chọn **"Start in test mode"** (cho development)
3. Chọn region: **`asia-southeast1` (Singapore)** hoặc gần bạn
4. Bấm **"Create"** và chờ tạo xong

### Bước 3: Tạo Service Account (cho Backend)

1. Vào **"Project Settings"** (bánh răng ở góc trên)
2. Chọn tab **"Service Accounts"**
3. Bấm **"Generate New Private Key"**
4. File JSON sẽ tự động tải về → **lưu vào `backend/src/configs/serviceAccountKey.json`**
5. **Quan trọng**: Đừng commit file này! Hãy thêm vào `.gitignore`

### Bước 4: Bật Authentication (Email)

1. Vào menu **"Authentication"**
2. Bấm tab **"Sign-in method"**
3. Bấm **"Email/Password"** → **"Enable"** → **"Save"**
4. Bấm **"Email link (passwordless)"** → **"Enable"** → **"Save"**

### Bước 5: Lấy Firebase Config (cho Frontend)

1. Vào **"Project Settings"** → **"General"**
2. Kéo xuống tìm phần **"Your apps"**
3. Bấm vào app web (hoặc tạo nếu chưa có)
4. Sao chép cấu hình Firebase:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     databaseURL: "..."
   }
   ```
5. Sử dụng giá trị này cho Frontend `.env`

---

## Setup GitHub OAuth

### Bước 1: Tạo GitHub OAuth App

1. Truy cập [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Bấm **"New OAuth App"**
3. Điền thông tin:
   - **Application name**: `Mini Trello`
   - **Homepage URL**: `http://localhost:5173` (dev) hoặc domain thực
   - **Authorization callback URL**: `http://localhost:5173/github/callback` (dev)
4. Bấm **"Register application"**
5. Sao chép:
   - **Client ID**
   - **Client Secret** (bấm "Generate a new client secret")

### Bước 2: Lưu GitHub Config

Sẽ dùng trong `backend/.env`:

```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=http://localhost:5173/github/callback
```

---

## Cấu Hình Backend

### File: `backend/.env`

Tạo file `.env` ở thư mục `backend/` với nội dung:

````env
# Server
PORT=5000
NODE_ENV=development

```env
# Server
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-not-regular-password

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5173/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
````

**Lưu ý quan trọng:**
- `serviceAccountKey.json` phải có sẵn (từ Firebase Setup)
- `JWT_SECRET`: Tạo string ngẫu nhiên dài 32+ ký tự
- `EMAIL_PASSWORD`: Nếu dùng Gmail, tạo [App Password](https://support.google.com/accounts/answer/185833) (không phải password thường)

### Cấu Trúc Backend

```
backend/
├── src/
│ ├── server.js # Entry point
│ ├── configs/
│ │ ├── firebase.js # Init Firebase Admin SDK
│ │ ├── github.js # GitHub OAuth config
│ │ └── serviceAccountKey.json (IGNORED - not in repo)
│ ├── controllers/
│ │ ├── authController.js # Auth: signup, signin, getMe, updateProfile
│ │ ├── boardController.js # Board CRUD, invite, getSentInvites
│ │ ├── cardController.js # Card CRUD
│ │ ├── taskController.js # Task CRUD, assign members
│ │ └── githubController.js # GitHub integration
│ ├── middlewares/
│ │ └── auth.js # JWT authentication
│ ├── models/
│ │ ├── User.js # User schema & methods
│ │ ├── Board.js # Board schema & methods
│ │ ├── Card.js # Card schema & methods
│ │ └── Task.js # Task schema & methods
│ ├── routes/
│ │ ├── authRoute.js # Auth endpoints
│ │ ├── boardRoute.js # Board endpoints
│ │ ├── cardRoute.js # Card endpoints
│ │ ├── taskRoute.js # Task endpoints
│ │ └── githubRoute.js # GitHub endpoints
│ └── utils/
│ ├── email.js # Email sending
│ └── helper.js # Utilities
├── package.json
└── .env (IGNORED - not in repo)
```

### API Endpoints Chính
```
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/signup` | Đăng ký |
| POST | `/auth/signin` | Đăng nhập |
| GET | `/auth/me` | Lấy thông tin user hiện tại |
| PUT | `/auth/profile` | Cập nhật firstName, lastName |
| GET | `/auth/:userId` | Lấy thông tin user by ID |
| GET | `/boards` | Lấy danh sách board của user |
| POST | `/boards` | Tạo board mới |
| GET | `/boards/:id` | Chi tiết board |
| PUT | `/boards/:id` | Cập nhật board |
| DELETE | `/boards/:id` | Xóa board |
| POST | `/boards/:boardId/invite` | Mời thành viên |
| GET | `/boards/invites` | Lấy lời mời nhận được |
| GET | `/boards/sent-invites` | Lấy lời mời đã gửi |
| POST | `/boards/:boardId/invite/accept` | Chấp nhận/từ chối lời mời |
| GET | `/boards/:boardId/cards` | Lấy danh sách card |
| POST | `/boards/:boardId/cards` | Tạo card mới |
| PUT | `/boards/:boardId/cards/:cardId` | Cập nhật card |
| DELETE | `/boards/:boardId/cards/:cardId` | Xóa card |
| GET | `/boards/:boardId/cards/:cardId/tasks` | Lấy danh sách task |
| POST | `/boards/:boardId/cards/:cardId/tasks` | Tạo task mới |
| PUT | `/boards/:boardId/cards/:cardId/tasks/:taskId` | Cập nhật task |
| DELETE | `/boards/:boardId/cards/:cardId/tasks/:taskId` | Xóa task |
```

## Cấu Hình Frontend

### File: `frontend/.env`

Tạo file `.env` ở thư mục `frontend/` với nội dung:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**Ghi chú:** Lấy các giá trị từ [Firebase Console → Project Settings → General](#bước-5-lấy-firebase-config-cho-frontend). Các giá trị `your-*` sẽ thay bằng thông tin Firebase project của bạn.

### Cấu Trúc Frontend

```
frontend/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Router setup
│   ├── index.css                # Global + utility CSS
│   ├── components/
│   │   ├── board/
│   │   │   ├── CreateBoardModal.tsx      # Modal tạo board
│   │   │   ├── InvitationsModal.tsx      # Modal nhận lời mời
│   │   │   ├── InviteMemberModal.tsx     # Modal mời thành viên
│   │   │   └── SentInvitationsModal.tsx  # Modal xem lời mời đã gửi
│   │   ├── card/
│   │   │   ├── CardItem.tsx              # Card component
│   │   │   ├── CardList.tsx              # List of cards
│   │   │   ├── CardEditModal.tsx         # Edit/delete card
│   │   │   └── CreateCardModal.tsx       # Create card modal
│   │   ├── task/
│   │   │   ├── TaskBoard.tsx             # Task board (drag-drop)
│   │   │   ├── TaskColumn.tsx            # Task column
│   │   │   ├── TaskCard.tsx              # Task card
│   │   │   ├── TaskBoardModal.tsx        # Task board modal
│   │   │   ├── CreateTaskModal.tsx       # Create/assign task
│   │   │   └── TaskAssignmentModal.tsx   # Assign members to task
│   │   └── layout/
│   │       ├── Layout.tsx                # Main layout
│   │       └── Navbar.tsx                # Navigation bar
│   ├── pages/
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Signup page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── BoardDetail.tsx      # Single board page
│   │   ├── Settings.tsx         # User settings
│   │   └── GitHubCallback.tsx   # GitHub OAuth callback
│   ├── services/
│   │   ├── api.ts               # API client (axios)
│   │   └── socket.ts            # WebSocket setup
│   ├── stores/
│   │   ├── authStore.ts         # Auth state (Zustand)
│   │   ├── boardStore.ts        # Board state
│   │   ├── cardStore.ts         # Card state
│   │   ├── taskStore.ts         # Task state
│   │   └── githubStore.ts       # GitHub state
│   └── types/
│       ├── auth.ts              # Auth types
│       ├── board.ts             # Board types
│       ├── card.ts              # Card types
│       ├── task.ts              # Task types
│       ├── github.ts            # GitHub types
│       └── socket.ts            # Socket types
├── package.json
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── .env (IGNORED - not in repo)
```

### Stack & Dependencies

**Frontend Stack:**

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing
- **Lucide React** - Icons
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting
- **dnd-kit** - Drag & drop

---

## Cài Đặt & Chạy

### Prerequisite

Đã tạo Firebase Project
Đã setup GitHub OAuth App
Đã download `serviceAccountKey.json`
Đã tạo file `.env` cho backend & frontend

### Bước 1: Clone & Cài Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/Mini-Trello.git
cd Mini-Trello

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 2: Chạy Backend

```bash
cd backend
npm start
```

Khoá trạng thái:

```
================================
Server đang chạy trên port 5000
================================
API Health Check: http://localhost:5000/health
Firebase Health Check: http://localhost:5000/health-firebase
API Documentation: http://localhost:5000/
================================
```

### Bước 3: Chạy Frontend (Terminal khác)

```bash
cd frontend
npm run dev
```

Khoá trạng thái:

```
  VITE v5.x.x  ready in xx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Bước 4: Mở trình duyệt

Truy cập: **http://localhost:5173**

---

## Database Schema (Firestore)

### Collections

#### `users`

```javascript
{
  id: "user-id",
  email: "user@example.com",
  firstName: "Nguyễn",
  lastName: "Văn A",
  verificationCode: "123456",
  codeExpiresAt: "2026-02-09T...",
  verified: true,
  lastLogin: "2026-02-09T...",
  createdAt: "2026-01-01T...",
  updatedAt: "2026-02-09T...",
  githubUsername: "username",
  githubAvatarUrl: "https://...",
  githubConnectedAt: "2026-02-09T..."
}
```

#### `boards`

```javascript
{
  id: "board-id",
  name: "Project Alpha",
  description: "Main project",
  ownerId: "user-id",
  members: ["user-id-1", "user-id-2"],
  createdAt: "2026-01-01T...",
  updatedAt: "2026-02-09T..."
}
```

#### `cards`

```javascript
{
  id: "card-id",
  boardId: "board-id",
  name: "Feature: User Auth",
  description: "Implement email verification",
  ownerId: "user-id",
  list_member: ["user-id-1"],
  tasks_count: 5,
  createdAt: "2026-01-01T...",
  updatedAt: "2026-02-09T..."
}
```

#### `tasks`

```javascript
{
  id: "task-id",
  boardId: "board-id",
  cardId: "card-id",
  title: "Design API endpoints",
  description: "RESTful API design",
  status: "ongoing", // icebox, backlog, ongoing, review, done
  priority: "high",  // low, medium, high
  ownerId: "user-id",
  assignedMembers: ["user-id-1", "user-id-2"],
  deadline: "2026-02-15",
  createdAt: "2026-01-01T...",
  updatedAt: "2026-02-09T..."
}
```

#### `invitations`

```javascript
{
  id: "invite-id",
  boardId: "board-id",
  board_owner_id: "user-id",
  member_id: "invited-user-id",
  email_member: "invitee@example.com",
  status: "pending", // pending, accepted, declined
  createdAt: "2026-02-09T...",
  updatedAt: "2026-02-09T..."
}
```

---

## Production Deployment

### Backend (Heroku / Railway / Vercel)

1. Set environment variables trên hosting platform
2. Đảm bảo `serviceAccountKey.json` được cài đặt (qua ENV hoặc Secret Manager)
3. Deploy:
   ```bash
   # Heroku example
   git push heroku main
   ```

### Frontend (Vercel / Netlify)

1. Kết nối GitHub repo
2. Cấu hình Environment Variables (`.env` values)
3. Set Build Command: `npm run build`
4. Set Start Command: `npm run preview`

---

## Troubleshooting

### Firebase Connection Error

- Kiểm tra `FIREBASE_PROJECT_ID` trong `.env`
- Kiểm tra `serviceAccountKey.json` tồn tại & có quyền đọc
- Kiểm tra Firestore Database đã được bật

### Email Not Sending

- Kiểm tra Gmail App Password (nếu dùng Gmail)
- Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD` đúng
- Kiểm tra SMTP quyền (Gmail cần bật "Less secure apps" hoặc App Password)

### GitHub OAuth Failed

- Kiểm tra `GITHUB_CLIENT_ID` và `GITHUB_CLIENT_SECRET` đúng
- Kiểm tra Callback URL in GitHub Settings trùng với `.env`
- Kiểm tra Frontend `.env` có `VITE_API_BASE_URL` đúng

### Port Already in Use

```bash
# Kill process on port
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## Sổ Tay Phát Triển

### Thêm Feature Mới

1. **Backend**:
   - Thêm model → controller → route
   - Thêm API endpoint trong `routes/`
   - Test với Postman/cURL

2. **Frontend**:
   - Thêm type định nghĩa trong `types/`
   - Thêm API client method trong `services/api.ts`
   - Thêm state/action trong `stores/`
   - Tạo component/page
   - Kết nối với route trong `App.tsx`

### Testing

```bash
# Backend
npm test

# Frontend
npm run test
```

---

## License

MIT License - Tự do sử dụng cho mục đích cá nhân & thương mại

**Happy Coding! 🎉**
