# Cập nhật đội PvP từ 阳间斗技

Yêu cầu Node.js và Microsoft Edge. Chạy `npm install` một lần trong thư mục này.

```powershell
node collector.cjs --full
node collector.cjs --full --dry-run
node collector.cjs --apply
```

`--full` đọc tất cả trang theo bộ lọc mặc định và xuất file JSON cùng CSV trong `output/`, không thay dữ liệu website. CSV mở bằng Excel; JSON ghi thêm tổng nguồn báo, số dòng thu được, tên, ID và cảnh báo. Lần chạy ngày 16/11 nguồn báo 684 đội nhưng trả 693 dòng; bot giữ nguyên mọi dòng và ghi cảnh báo. Một đội có tên chưa khớp catalog. Kiểm tra dữ liệu trước khi dùng. `--dry-run` không tạo file. Chỉ lệnh `--apply` mới thay snapshot website; khi kết hợp `--full`, bot từ chối ghi nếu tổng nguồn không khớp hoặc dữ liệu có lỗi. Website hiện thiết kế cho 20 đội, cần sửa giao diện trước khi áp dụng full. Không tự chạy định kỳ, tự commit hay push.

`npm test` kiểm tra các tình huống dữ liệu hợp lệ và lỗi. Trang nguồn có thể thay đổi; nếu trang yêu cầu đăng nhập hoặc không truy cập được, bot sẽ báo lỗi.

## Thống kê PvP thức thần

Chạy `node collect-heroes.cjs --dry-run` để thử không ghi; chạy `node collect-heroes.cjs` để xuất `output/hero-pvp.json` cho người dùng duyệt. Script chỉ đọc bảng xếp hạng đang hiển thị trên nguồn với bộ lọc mặc định, không cam kết đủ mọi thức thần. Kiểm tra danh sách chưa khớp, phạm vi, thời điểm và tỷ lệ trước khi tự sao chép bản duyệt vào `curated/hero-pvp.json`; sau đó kiểm tra trang và thay đổi Git. Không tự push hoặc ghi đè dữ liệu website. Chạy `node --test test-heroes.cjs` để kiểm tra bộ chuyển đổi.
