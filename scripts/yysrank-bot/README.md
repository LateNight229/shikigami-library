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

Dashboard local chạy cả hai bot trong một lượt, kiểm tra kỳ và rank chung rồi xuất báo cáo để duyệt. Khi áp dụng, nó cập nhật dữ liệu đội và `curated/hero-counter-periods.json` cùng nhau, giữ bản sao để khôi phục nếu lỗi; tên chưa khớp hoặc kỳ/rank lệch sẽ chặn áp dụng. Dữ liệu khắc chế kỳ 10/10 đã có sẵn; các kỳ không có snapshot không xuất hiện trong bộ chọn. Kỳ mới nhất có dữ liệu được chọn mặc định.

`curated/hero-counters.json` là snapshot cũ dùng làm nguồn tạo kỳ ban đầu; giao diện hiện đọc `hero-counter-periods.json`. Nếu chạy bot độc lập, file output chỉ để kiểm tra, không tự cập nhật registry. Thông số `hero-pvp.json` vẫn có luồng nhập riêng. Không tự commit/push; nếu người dùng chủ động xuất bản bằng dashboard, ba file dữ liệu đội/kỳ và registry khắc chế được đưa vào cùng commit.

