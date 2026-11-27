# Cào thử hồ sơ BiliGame

Bot độc lập, dùng Python 3, không cần thư viện ngoài. Trên máy này, từ thư mục `scripts/biligame-bot`:

```powershell
.\run-full.bat
.\run.bat --dry-run
.\run.bat
```

Nhấp đúp `run-full.bat` hoặc chạy lệnh trên để thu danh sách đã lưu trong `catalog-2026-11-26.json` (287 mục, trích từ danh mục wiki ngày 26/11/2026). File `output/all-shikigami.json` được lưu sau mỗi trang; chạy lại sẽ tiếp tục các trang chưa thu được, không tự làm mới các trang đã lưu. `catalog` là danh sách mục tiêu, `records` là trang đã thu, `errors` là lỗi, `complete` chỉ đúng khi thu xong mọi trang. Dữ liệu thiếu trong trang được báo trong từng record; không mặc định là wiki không có. Nếu muốn cào mới, chuyển hoặc đổi tên file snapshot cũ trước khi chạy. Không chạy hai bản cùng ghi một file. Dừng bằng Ctrl+C, hoặc đóng cửa sổ sau khi lưu tiến độ.

Có thể thử giới hạn: `.\run.bat --all --limit 3`. Bot nghỉ ít nhất 2 giây giữa các trang; khi nguồn trả lỗi HTTP, bot dừng và giữ tiến độ. Chạy lại sau khi nguồn cho phép. Toàn bộ nghĩa là các dòng trong danh sách đã lưu, kể cả nhân vật chưa ra mắt nếu nguồn liệt kê; không bảo đảm mọi trang có đủ nội dung hoặc được nhận diện đúng. Không tự đối chiếu ID ShikiLib. Ảnh và video được lưu bằng URL, không tải bản media.

`run.bat` dùng Python trong `.venv` của repo Bot_Onmyoji trên máy này; nếu di chuyển máy cần sửa đường dẫn hoặc dùng Python 3 đã cài. Kết quả mặc định được lưu vào `output/sample.json` cạnh bot. Có thể truyền `--url` và `--output` như các ví dụ bên dưới.

Nếu máy có lệnh `python` hoạt động, chạy tại gốc repo:

```powershell
python scripts/biligame-bot/collect.py --dry-run
python scripts/biligame-bot/collect.py --output scripts/biligame-bot/output/sample.json
python scripts/biligame-bot/collect.py --url "https://wiki.biligame.com/yys/笼梦祸津神" --output my-preview.json
python -m unittest discover -s scripts/biligame-bot -p 'test_*.py'
```

Thu một trang mỗi lần: giới thiệu nguyên văn tiếng Trung, URL ảnh gốc và ảnh xem trước của từng tab ngoại hình, BV và số phần video triệu hồi khi nhận diện được. Đây là snapshot để duyệt, không tải ảnh/video, không dịch hay cập nhật website. `warnings` báo nội dung thiếu hoặc định dạng chưa nhận diện; không suy ra dữ liệu không tồn tại. Tab ngoại hình mặc định không có nghĩa có skin bổ sung. Một số cấu trúc khác, nhất là chế độ video không phải một phần cụ thể, cần kiểm tra thủ công.

Trước khi mở rộng hàng loạt, kiểm tra robots.txt, điều khoản, tốc độ truy cập, độ bao phủ, tên/ID, quyền sử dụng và dịch thuật. Không tự ghi vào dữ liệu website hoặc xuất bản.

Nguồn đã có lần trả HTTP 567 khi thử lại; bot dừng với lỗi HTTP, không vượt chặn. Chờ nguồn cho phép truy cập bình thường trước khi thử lại; không coi một lần cào thành công là bảo đảm chạy ổn định.

Nếu gặp 567 hoặc 514: đóng bot, chờ ít nhất vài phút rồi chạy lại một lần. Nếu vẫn bị, mở trang wiki trong trình duyệt để kiểm tra và liên hệ quản trị wiki, cung cấp thời điểm và mã yêu cầu nếu trang lỗi hiển thị. Không chạy lại liên tục; nếu đã có snapshot, kết quả đã lưu được giữ lại. Trang web mở được không bảo đảm bot được nguồn cho phép truy cập tự động.
