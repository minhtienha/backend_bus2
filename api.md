## 1. Uploads Module

### 1.1 Upload file

**POST** `https://uploads-opbb.onrender.com/api/uploads`
**Body:**

- `file`: File ảnh

### 1.2 Lấy file

**GET** `https://uploads-opbb.onrender.com/api/uploads/:id`

### 1.3 Xóa file

**DELETE** `https://uploads-opbb.onrender.com/api/uploads/:id`

## 2. Feedback Module

### 2.1 Tạo phản ánh

**POST** `https://feedback-service-93if.onrender.com/api/feedback`
**Body:**

```json
{
  "Category": "SUGGESTION",
  "Content": "Tài xế tuyến 152 hôm nay chạy rất êm và nhiệt tình.",
  "Location": {
    "type": "Point",
    "coordinates": [106.68234, 10.76262],
    "address": "Sân bay Tân Sơn Nhất"
  },
  "ImageUrl": "https://api.domain.com/uploads/1700001234-image.jpg",
  "FullName": "Nguyễn Văn A",
  "PhoneNumber": "0901234567",
  "Email": "nva@gmail.com",
  "IsAnonymous": false
}
```

**Ghi chú:** `createdBy` và `updatedBy` được tự động thiết lập từ user đang xác thực (không cần truyền vào body).

**Category:**

- `SERVICE_QUALITY` = 'SERVICE_QUALITY',
- `COMMENDATION` = 'COMMENDATION',
- `INFRASTRUCTURE` = 'INFRASTRUCTURE',
- `ROUTE_AND_SCHEDULE` = 'ROUTE_AND_SCHEDULE',
- `OTHER` = 'OTHER',

### 2.2 Danh sách phản ánh

**GET** `https://feedback-service-93if.onrender.com/api/feedback`
**Query (tùy chọn):**

```text
?page=1&limit=10&status=PENDING&category=COMPLAINT
```

**Response (200):**

```json
{
  "data": [],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2.3 Chi tiết phản ánh

**GET** `https://feedback-service-93if.onrender.com/api/feedback/:id`
**Response (200):**

```json
{
  "_id": "658b1a2c...",
  "Category": "SUGGESTION",
  "Content": "Tài xế tuyến 152...",
  "Location": {},
  "ImageUrl": "...",
  "Status": "PROCESSING",
  "IsPublic": true,
  "createdAt": "2026-06-22T10:00:00.000Z"
}
```

### 2.4 Cập nhật phản ánh

**PATCH** `https://feedback-service-93if.onrender.com/api/feedback/:id`
**Body:**

```json
{
  "Status": "PROCESSING",
  "IsPublic": true,
  "Note": "Đang phối hợp kiểm tra."
}
```

### 2.5 Xóa phản ánh

**DELETE** `https://feedback-service-93if.onrender.com/api/feedback/:id`
**Response (200):**

```json
{
  "message": "Đã xóa phản ánh thành công",
  "success": true
}
```
