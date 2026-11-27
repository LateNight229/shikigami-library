# Bot tải ảnh thức thần

Dùng Node.js 18 trở lên. Để tải các ID 200–612 vào một thư mục bên ngoài repo:

```powershell
node scripts/portrait-collector/collect.cjs --range "C:\Users\VanAnh\Documents\ShikiLib-portraits"
```

Bot lần lượt yêu cầu `https://thucthanluc.io.vn/portraits/<ID>.png`, lưu ảnh thành `<ID>.png`, bỏ qua file đã tồn tại, chờ một giây giữa các yêu cầu và ghi `report.json`. ID không có ảnh sẽ được ghi lỗi. Mỗi lỗi được ghi vào báo cáo và bot tiếp tục với ID tiếp theo; chạy lại cùng lệnh để thử lại các ảnh chưa có. Bot kiểm tra chữ ký PNG và giới hạn 20 MiB, chưa xác minh toàn bộ nội dung ảnh. Không tự upload R2.

Cũng có thể dùng danh sách nguồn được phép dạng `[{"id":"612","url":"https://example.com/612.png"}]`:

```powershell
node scripts/portrait-collector/collect.cjs duong-dan-danh-sach.json duong-dan-thu-muc-anh
```
