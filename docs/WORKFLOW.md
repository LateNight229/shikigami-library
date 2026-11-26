# Website và quy trình làm việc

- Website tĩnh HTML/CSS/JavaScript cho GitHub Pages. Để xem local, chạy `python -m http.server 8768 --bind 127.0.0.1` tại gốc repo rồi mở `http://127.0.0.1:8768/`; trang fetch JSON nên không mở trực tiếp file HTML.
- Kiểm tra cú pháp JavaScript đã sửa bằng `node --check <file>`, chạy test liên quan trong `tests/` bằng Node và kiểm tra giao diện khi thay đổi có ảnh hưởng hiển thị. Ghi rõ những gì chưa thử; không xem test cũ là bằng chứng nếu chưa chạy. Kiểm tra điều kiện commit của dự án quản lý công việc trước khi commit.
- `HANDOFF.md` là lịch sử checkpoint, có thể lỗi thời; kiểm tra Git và mục bàn giao liên quan trong `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/docs/PROGRESS.md` để biết trạng thái, không mặc định đọc toàn bộ lịch sử.
- Mỗi milestone dùng một nhánh `feat/milestone-N`, tiếp tục dùng nhánh đó; nếu chuyển chat giữa chừng, ghi IN_PROGRESS và tiếp tục đúng milestone. Trạng thái: NOT_STARTED → IN_PROGRESS → READY_FOR_REVIEW → APPROVED → DONE. Chỉ DONE khi đạt tiêu chí, được duyệt và xác minh merge vào main.
- Trước checkpoint và khi kết thúc chat, ghi ngắn vào PROGRESS: đã làm/chưa làm, kiểm tra thực tế, quyết định và cách thử không đạt, đầu ra, nhánh/base/commit hoặc PR, tài nguyên local cần tái tạo, bước tiếp theo. Không ghi SHA tự tham chiếu của commit đang tạo; sau merge xác minh bằng Git/PR.
- Không đưa tiến độ riêng vào template dùng chung. Commit nhỏ với message `feat: ...`, `fix: ...` hoặc `chore: ...`; không push/merge khi chưa được phép.

- Chống lỗi lặp tải ảnh thức thần: khi JSON chưa tải xong phải hiển thị ngay icon thức thần, đồng thời bắt đầu tải ảnh lớn; không thay bằng màn hình chữ chờ. Giữ tải trước ảnh liền kề và kiểm tra mạng chậm, chuyển nhanh, ảnh lỗi sau mọi thay đổi luồng chọn hoặc hiển thị thức thần.
