# Bàn giao website thư viện thức thần

- Repo làm việc chính: `E:/1_Github/shikigami-library`, remote `https://github.com/LateNight229/shikigami-library.git`, nhánh `feat/website-bootstrap`. Chưa commit/push/publish.
- Website tĩnh HTML/CSS/JS, thiết kế cho GitHub Pages. Tin tức để sau; không làm Âm Dương Sư, Khiết linh, donate, đánh giá cộng đồng hoặc gửi đề xuất. Sort đồ sẽ bàn sau.
- Danh mục thức thần 278 bản ghi API CN lấy ngày 15/11/2026; chỉ #390 và #612 có mẫu kỹ năng. #390 có mô tả cơ bản dịch thủ công, tên/cấp chỉ số theo ảnh người dùng cần đối chiếu. Chưa hoàn thiện dữ liệu tiếng Việt, chỉ số, ngự hồn, hướng dẫn và đánh giá.
- Ảnh lớn từ CDN NetEase, có fallback icon; cần xem xét quyền sử dụng trước khi xuất bản. Bài guide Kamigame #390 có cảnh báo ngừng cập nhật năm 2025. Không sao chép hàng loạt đánh giá từ website tham khảo.
- UI: 3 panel chiếm chiều ngang, danh mục thu gọn phủ cột hình, panel hình/chỉ số không cuộn, panel nội dung cuộn; palette hồng. Chưa kiểm tra đủ kích thước desktop/mobile hoặc toàn bộ ảnh.
- Cách xem: từ repo chạy `python -m http.server 8768 --bind 127.0.0.1`, mở `http://127.0.0.1:8768/`. Kiểm tra cú pháp `node --check app.js`. Không mở `index.html` trực tiếp vì trang fetch JSON.
- Tiếp theo: duyệt giao diện và hoàn thiện nguồn dữ liệu có provenance, kiểm thử ảnh, thu thập/dịch chỉ số, skills và ngự hồn. Không công bố tự động nếu chưa xác minh độ chính xác/quyền. Chưa cấu hình GitHub Pages.
- Repo cũ `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji` giữ bot news và bản snapshot; website từ nay cập nhật tại repo này. Không tự push/merge khi chưa được yêu cầu.
