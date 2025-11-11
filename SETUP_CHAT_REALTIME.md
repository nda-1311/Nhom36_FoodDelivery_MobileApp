# Hướng dẫn Setup Chat Realtime

Tài liệu này hướng dẫn cách thiết lập hệ thống chat realtime cho ứng dụng Food Delivery.

## 📋 Tổng quan

Hệ thống chat realtime cho phép:

- ✅ Nhắn tin trực tiếp giữa khách hàng và tài xế
- ✅ Chat với nhà hàng về đơn hàng
- ✅ Liên hệ với bộ phận hỗ trợ
- ✅ Cập nhật tin nhắn realtime không cần refresh
- ✅ Đếm số tin nhắn chưa đọc
- ✅ Lưu lịch sử chat

## 🗄️ Database Setup

### Bước 1: Tạo Tables

Truy cập Supabase Dashboard → SQL Editor và chạy file migration:

```bash
supabase/migrations/create_chat_tables.sql
```

File này sẽ tạo:

- **conversations** table: Lưu thông tin cuộc hội thoại
- **messages** table: Lưu từng tin nhắn
- Indexes để tối ưu query performance
- RLS policies để bảo mật dữ liệu
- Functions và Triggers tự động

### Bước 2: Kiểm tra Tables

Sau khi chạy SQL, kiểm tra trong **Table Editor**:

#### Table: `conversations`

| Cột               | Kiểu        | Mô tả                                    |
| ----------------- | ----------- | ---------------------------------------- |
| id                | uuid        | Primary key                              |
| user_id           | uuid        | ID người dùng chính                      |
| other_user_id     | uuid        | ID người chat cùng                       |
| other_user_name   | text        | Tên người chat cùng                      |
| other_user_role   | text        | Vai trò (driver/restaurant/support/user) |
| other_user_avatar | text        | Avatar text                              |
| order_id          | text        | ID đơn hàng (nếu có)                     |
| last_message      | text        | Tin nhắn cuối cùng                       |
| last_message_time | timestamptz | Thời gian tin nhắn cuối                  |
| unread_count      | integer     | Số tin nhắn chưa đọc                     |
| status            | text        | Trạng thái (active/archived/blocked)     |
| created_at        | timestamptz | Thời gian tạo                            |
| updated_at        | timestamptz | Thời gian cập nhật                       |

#### Table: `messages`

| Cột             | Kiểu        | Mô tả                               |
| --------------- | ----------- | ----------------------------------- |
| id              | uuid        | Primary key                         |
| conversation_id | uuid        | ID cuộc hội thoại                   |
| sender_id       | uuid        | ID người gửi                        |
| receiver_id     | uuid        | ID người nhận                       |
| message_type    | text        | Loại tin nhắn (text/image/location) |
| content         | text        | Nội dung tin nhắn                   |
| image_url       | text        | URL hình ảnh (nếu có)               |
| location_lat    | double      | Vĩ độ (nếu là location)             |
| location_lng    | double      | Kinh độ (nếu là location)           |
| is_read         | boolean     | Đã đọc chưa                         |
| created_at      | timestamptz | Thời gian gửi                       |

### Bước 3: Enable Realtime

Trong Supabase Dashboard:

1. Vào **Database** → **Replication**
2. Tìm tables `conversations` và `messages`
3. Click **Enable** để bật Realtime cho cả 2 tables

## 🔐 Row Level Security (RLS)

RLS policies đã được thiết lập tự động:

### Conversations

- ✅ Users chỉ xem được conversations của mình
- ✅ Users có thể tạo conversation mới
- ✅ Users chỉ update/delete conversations của mình

### Messages

- ✅ Users chỉ xem được messages trong conversations của mình
- ✅ Users có thể gửi messages
- ✅ Users chỉ update/delete messages mình gửi

## 🚀 Sử dụng trong App

### InboxPage - Danh sách cuộc hội thoại

```typescript
// Load conversations
const { data } = await supabase
  .from("conversations")
  .select("*")
  .eq("user_id", userId)
  .order("updated_at", { ascending: false });

// Subscribe realtime updates
supabase
  .channel("conversations-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "conversations",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Handle insert/update/delete
    }
  )
  .subscribe();
```

### ChatPage - Tin nhắn

```typescript
// Load messages
const { data } = await supabase
  .from("messages")
  .select("*")
  .eq("conversation_id", conversationId)
  .order("created_at", { ascending: true });

// Subscribe new messages
supabase
  .channel(`messages:${conversationId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      // Add new message to UI
    }
  )
  .subscribe();

// Send message
await supabase.from("messages").insert([
  {
    conversation_id: conversationId,
    sender_id: currentUserId,
    receiver_id: otherUserId,
    message_type: "text",
    content: messageText,
  },
]);
```

## 🔧 Functions & Triggers

### Auto Update Last Message

Khi có tin nhắn mới, function `update_conversation_last_message()` tự động:

- Cập nhật `last_message` và `last_message_time`
- Tăng `unread_count` cho người nhận

### Mark Messages as Read

Call function để đánh dấu đã đọc:

```typescript
await supabase.rpc("mark_messages_as_read", {
  conv_id: conversationId,
  user_id: currentUserId,
});
```

Function này sẽ:

- Set `is_read = true` cho tất cả messages chưa đọc
- Reset `unread_count = 0` trong conversation

## 📊 Demo Data

Nếu chưa có dữ liệu thật, app sẽ tự động hiển thị demo data:

```typescript
// InboxPage demo conversations
const demoData = [
  {
    id: "demo-1",
    other_user_name: "John Cooper",
    other_user_role: "driver",
    last_message: "Tôi đang trên đường đến!",
    unread_count: 2,
  },
  // ...
];

// ChatPage demo messages
const demoMessages = [
  {
    sender_id: "driver-id",
    content: "Hi, I'm on my way...",
    created_at: new Date().toISOString(),
  },
  // ...
];
```

## 🎨 Features

### InboxPage

- ✅ Danh sách conversations với avatar, tên, role
- ✅ Hiển thị tin nhắn cuối cùng
- ✅ Badge đếm tin nhắn chưa đọc
- ✅ Status indicator (active/online/offline)
- ✅ Pull-to-refresh
- ✅ Realtime updates tự động
- ✅ Quick actions: Call và Chat

### ChatPage

- ✅ Header với thông tin người chat
- ✅ Danh sách tin nhắn với bubbles
- ✅ Phân biệt tin nhắn của mình và người khác
- ✅ Avatar cho mỗi tin nhắn
- ✅ Timestamp hiển thị đẹp
- ✅ Hỗ trợ gửi text (có thể mở rộng cho image, location)
- ✅ Auto scroll to bottom khi có tin nhắn mới
- ✅ Realtime nhận tin nhắn ngay lập tức
- ✅ Quick actions: Share location, Call

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"

→ Chưa chạy migration. Quay lại Bước 1.

### Tin nhắn không realtime

→ Kiểm tra Realtime đã enable trong Database → Replication.

### Không load được conversations

→ Kiểm tra user đã đăng nhập chưa (`supabase.auth.getUser()`).

### RLS policy error

→ Đảm bảo `auth.uid()` match với `user_id` trong query.

## 📝 Mở rộng

### Thêm typing indicator

```typescript
// Broadcast typing status
channel.send({
  type: "broadcast",
  event: "typing",
  payload: { user_id: userId },
});
```

### Thêm gửi hình ảnh

```typescript
// Upload to Supabase Storage
const { data: upload } = await supabase.storage
  .from("chat-images")
  .upload(`${conversationId}/${Date.now()}.jpg`, imageFile);

// Send message với image_url
await supabase.from("messages").insert([
  {
    message_type: "image",
    content: "Sent an image",
    image_url: upload.path,
    // ...
  },
]);
```

### Thêm voice messages

- Upload audio file to Supabase Storage
- Thêm cột `audio_url` vào messages table
- Update message_type thêm "audio"

## ✅ Checklist

- [ ] Chạy SQL migration để tạo tables
- [ ] Enable Realtime cho conversations và messages
- [ ] Kiểm tra RLS policies đã active
- [ ] Test gửi tin nhắn
- [ ] Test realtime updates
- [ ] Test đếm unread messages
- [ ] Test mark as read
- [ ] Test với nhiều users khác nhau

## 🎯 Next Steps

Sau khi setup xong chat, bạn có thể:

1. Tích hợp với order tracking để tự động tạo conversation
2. Thêm push notifications khi có tin nhắn mới
3. Thêm chat với support team
4. Tạo chat groups cho party orders

---

**Lưu ý:** Đảm bảo đã cài đặt Supabase client và configured trong `lib/supabase/client.ts` trước khi sử dụng chat realtime.
