# Backend/API todo cho các UI mới

File này tổng hợp các chức năng frontend vừa thêm trong trang **Thư viện của tôi** và **Lịch sử buổi học/Báo cáo buổi học** nhưng backend/API hiện chưa đủ để sử dụng thật.

## 1. Thư viện của tôi

Frontend hiện đang dùng được:

- `GET /api/Document/my` qua `getMyDocuments()`
- `DELETE /api/Document/{id}` qua `deleteDocument(id)`
- `GET quizzes by documents` qua `getQuizzesByDocuments(documents)`
- `GET questions by quiz` qua `getQuestionsByQuiz(quizId)`
- `DELETE quiz` qua `deleteQuiz(id)`

Các UI mới cần backend hỗ trợ thêm:

### 1.1. Tìm kiếm bài giảng/bộ câu hỏi

Hiện tại frontend đang filter client-side trên data đã tải.

Backend nên có API search để dùng khi dữ liệu nhiều:

```http
GET /api/library/search?q={keyword}&type={all|documents|quizzes}&page=1&pageSize=20
```

Response gợi ý:

```json
{
  "items": [
    {
      "id": 1,
      "type": "document",
      "title": "Bài giảng chương 1",
      "createdAt": "2026-06-03T08:00:00Z",
      "questionCount": 10,
      "status": "Ready"
    }
  ],
  "total": 42
}
```

### 1.2. Lưu nội dung

UI đang có menu item **Lưu** nhưng chưa gọi API.

Endpoint gợi ý:

```http
POST /api/library/items/{type}/{id}/save
DELETE /api/library/items/{type}/{id}/save
```

Field cần trả về trong list:

```json
{
  "isSaved": true
}
```

### 1.3. Nhân bản và sửa

UI đang có **Nhân bản và sửa** cho quiz và **Tạo bộ câu hỏi từ tài liệu** cho document.

Endpoint gợi ý:

```http
POST /api/Quiz/{id}/duplicate
POST /api/Document/{id}/generate-quiz
```

Response nên trả về quiz mới:

```json
{
  "id": 123,
  "title": "Bản sao - Quiz chương 1",
  "status": "AI_Drafted"
}
```

### 1.4. Lưu trữ nội dung

UI đang có **Lưu trữ** nhưng chưa gọi API.

Endpoint gợi ý:

```http
PATCH /api/library/items/{type}/{id}/archive
PATCH /api/library/items/{type}/{id}/restore
```

Field cần có:

```json
{
  "isArchived": false,
  "archivedAt": null
}
```

### 1.5. Chia sẻ với giáo viên/nhóm

UI đang có menu share nhưng chưa có API.

Endpoint gợi ý:

```http
POST /api/library/items/{type}/{id}/share
```

Payload gợi ý:

```json
{
  "targetType": "teacher",
  "targetIds": [10, 11],
  "permission": "view"
}
```

Hoặc:

```json
{
  "targetType": "team",
  "targetIds": [3],
  "permission": "edit"
}
```

### 1.6. Bộ sưu tập/nhóm

Frontend đã bỏ khỏi menu phụ theo yêu cầu hiện tại, nhưng nếu sau này dùng lại thì cần:

```http
GET /api/library/collections
POST /api/library/collections
POST /api/library/collections/{collectionId}/items
GET /api/teams/my
```

## 2. Báo cáo buổi học

Frontend hiện đang dùng:

- `GET /api/LiveSession/my` qua `getMySessions()`
- Click một buổi học sẽ quay về Library và mở quiz tương ứng nếu có `quizId`

Các UI mới cần backend hỗ trợ thêm:

### 2.1. Danh sách báo cáo có filter/search/server pagination

Hiện frontend đang filter client-side theo `status` và search theo title/pin.

Endpoint gợi ý:

```http
GET /api/reports/sessions?status={all|running|scheduled|completed|paused}&q={keyword}&classId={id}&resourceType={type}&from={date}&to={date}&page=1&pageSize=20
```

Response gợi ý:

```json
{
  "items": [
    {
      "id": 1,
      "quizId": 20,
      "title": "Ôn tập Toán chương 1",
      "quizTitle": "Quiz Toán chương 1",
      "status": "Completed",
      "pin": "482913",
      "createdAt": "2026-06-03T08:00:00Z",
      "classId": 5,
      "className": "Lớp 7A",
      "participantCount": 32,
      "averageScore": 78.5,
      "accuracy": 0.74,
      "durationSeconds": 900
    }
  ],
  "total": 12,
  "counts": {
    "all": 12,
    "running": 1,
    "scheduled": 2,
    "completed": 8,
    "paused": 1
  }
}
```

### 2.2. Chi tiết báo cáo buổi học

Frontend hiện chưa có màn chi tiết report, chỉ mở lại quiz từ session.

Endpoint gợi ý:

```http
GET /api/reports/sessions/{sessionId}
```

Response nên gồm:

```json
{
  "id": 1,
  "title": "Ôn tập Toán chương 1",
  "status": "Completed",
  "pin": "482913",
  "startedAt": "2026-06-03T08:00:00Z",
  "endedAt": "2026-06-03T08:15:00Z",
  "participantCount": 32,
  "averageScore": 78.5,
  "questions": [
    {
      "id": 101,
      "questionText": "Câu hỏi...",
      "correctRate": 0.82,
      "averageTimeSeconds": 14
    }
  ],
  "students": [
    {
      "id": 10,
      "name": "Nguyễn An",
      "score": 85,
      "correctAnswers": 8,
      "totalQuestions": 10
    }
  ]
}
```

### 2.3. Bộ lọc trên trang báo cáo

UI đã có các nút:

- `Loại nội dung`
- `Tất cả báo cáo`
- `Tất cả lớp`
- `Lọc theo ngày`

Cần API metadata:

```http
GET /api/reports/filters
```

Response gợi ý:

```json
{
  "resourceTypes": ["quiz", "document", "game"],
  "reportStatuses": ["Running", "Scheduled", "Completed", "Paused"],
  "classes": [
    { "id": 1, "name": "Lớp 6A" }
  ]
}
```

### 2.4. Trạng thái buổi học cần thống nhất

Frontend hiện map các status sau:

- `Active` hoặc `Running` -> Đang diễn ra
- `Scheduled` -> Đã lên lịch
- `Ended` hoặc `Completed` -> Đã hoàn thành
- `Pending` hoặc `Paused` -> Tạm dừng

Backend nên thống nhất một bộ status chính:

```txt
Running | Scheduled | Completed | Paused
```

## 3. Ưu tiên làm trước

1. `GET /api/reports/sessions` có filter/search/counts để trang Báo cáo buổi học chạy đúng.
2. `GET /api/reports/sessions/{sessionId}` để mở chi tiết báo cáo thay vì chỉ quay về quiz.
3. API archive/save/share/duplicate cho Library action menu.
4. API search Library server-side khi dữ liệu nhiều.

