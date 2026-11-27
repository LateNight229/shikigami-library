# Dữ liệu biên tập Cẩm nang PvP

`curated/pvp-guide-notes.json` chứa mảng `notes`. Chỉ thêm nội dung đã được kiểm chứng, với `enemyId` là ID đối thủ trong danh mục, `counterId` tùy chọn là ID thức thần ứng phó, `text` là lưu ý ngắn, `source` gồm `name` và `url`, và `updatedAt` là ngày kiểm tra nội dung. Ví dụ cấu trúc (không phải nội dung chiến thuật):

```json
{"notes":[{"enemyId":"597","counterId":"612","text":"Nội dung đã kiểm chứng","source":{"name":"Tên nguồn","url":"https://example.com/"},"updatedAt":"2026-11-27"}]}
```

Mảng hiện trống vì chưa có lưu ý nào được biên tập và kiểm chứng. Không xem dữ liệu mẫu trên là lời khuyên trong trận.
