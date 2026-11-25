# Cập nhật đội PvP từ 阳间斗技

Yêu cầu Node.js và Microsoft Edge. Chạy `npm install` một lần trong thư mục này.

```powershell
node collector.cjs --full
node collector.cjs --full --dry-run
node collector.cjs --apply
```

`--full` xuất JSON và CSV để duyệt, không thay dữ liệu website; `--dry-run` không ghi file. Dùng bảng điều khiển hoặc `node collector.cjs --apply-report <file>` để áp dụng bản đã duyệt; nếu nguồn trả dư, chỉ thêm `--accept-extra` sau khi kiểm tra các dòng dư. Mỗi thời điểm cập nhật mới của nguồn lưu dữ liệu hiện tại vào `curated/team-periods.json` trước khi thay kỳ hiện tại. Áp dụng lại cùng dữ liệu không tạo thêm kỳ. Bot so hạng đội theo 5 ID với kỳ ngay trước nếu các bộ lọc khác ngoài tên kỳ khớp; hạng cũ vượt số đội kỳ mới và đội không khớp để trống. Các bảng đội và đề cử thức thần dùng chung kỳ được chọn; tối đa 5 kỳ gần nhất hiển thị, dữ liệu cũ hơn vẫn được lưu. Không tự chạy định kỳ, commit hay push.

`npm test` kiểm tra các tình huống dữ liệu hợp lệ và lỗi. Trang nguồn có thể thay đổi; nếu trang yêu cầu đăng nhập hoặc không truy cập được, bot sẽ báo lỗi.

## Thống kê PvP thức thần

Chạy `node collect-heroes.cjs --dry-run` để thử không ghi; chạy `node collect-heroes.cjs` để xuất `output/hero-pvp.json` cho người dùng duyệt. Script chỉ đọc bảng xếp hạng đang hiển thị trên nguồn với bộ lọc mặc định, không cam kết đủ mọi thức thần. Kiểm tra danh sách chưa khớp, phạm vi, thời điểm và tỷ lệ trước khi tự sao chép bản duyệt vào `curated/hero-pvp.json`; sau đó kiểm tra trang và thay đổi Git. Không tự push hoặc ghi đè dữ liệu website. Chạy `node --test test-heroes.cjs` để kiểm tra bộ chuyển đổi.
# Khắc chế trên bảng xếp hạng

`node collect-heroes.cjs --dry-run` kiểm tra mà không ghi file. `node collect-heroes.cjs` xuất thêm `output/hero-counters.json` để duyệt, cùng với file PvP; không tự cập nhật website. Bot đọc tất cả icon trong cột `受制于` nguồn thực sự hiển thị, không áp giới hạn ba, không truy cập dữ liệu Pro. Nguồn hiện có thể chỉ hiển thị ba icon và không có ý nghĩa là danh sách đầy đủ.

Đối chiếu `source`, `unmatched`, `sourceCount` và danh sách `counters` trong file trước khi sao chép vào `curated/hero-counters.json`. Tên không khớp không tự gán ID, không lấy ID trực tiếp của nguồn. Chỉ áp dụng snapshot sau khi kiểm tra điều kiện thời gian, rank, số dòng và độ đầy đủ; giữ file cũ khi nguồn lỗi. Sau khi duyệt và cập nhật dữ liệu website, kiểm tra diff, commit và push theo quy trình repo.

