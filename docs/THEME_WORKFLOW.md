# Quy tắc theme website

- Trước khi làm: đọc theme.js, theme.css, stylesheet của theme liên quan và danh sách stylesheet trong index.html; chỉ mở thêm CSS/JS của tab cần kiểm tra. Kiểm tra Git và giữ nguyên thay đổi đang có.
- Chốt bảng màu theo vai trò: nền, panel, chữ, chữ phụ, viền, nút, hover, focus, đang chọn, disabled, thông báo. Tách màu nhận diện độ hiếm và trạng thái tăng/giảm khỏi màu trang trí.
- Ưu tiên biến CSS theo vai trò và selector giới hạn bằng data-appearance; áp dụng đầy đủ state, popup, form, bảng, menu, hộp thoại. Không ghi đè giao diện mặc định hoặc dark mode của theme khác. Tránh filter đổi màu toàn bộ vì ảnh và màu trạng thái có ý nghĩa.
- Rà lần lượt Thức thần (danh mục, chi tiết, kỹ năng, đánh giá và PvP), Ngự hồn, Tạo đội (ô chọn và hộp thoại ngự), Đội hình (Của tôi, Cộng đồng, Đội mẫu, admin) và So sánh (chỉ số, kỹ năng, popup). Tìm màu hardcode trong CSS liên quan bằng rg và kiểm tra độ ưu tiên stylesheet; không đoán đã phủ hết chỉ dựa vào trang đầu.
- Kiểm tra desktop và mobile: văn bản dễ đọc, nút và focus nhìn rõ, không tràn/che nội dung; kiểm tra trạng thái trống, đang tải, lỗi khi có. Hiệu ứng không cản thao tác, hỗ trợ prefers-reduced-motion; nhạc có nút tắt, âm lượng và xử lý autoplay bị chặn.
- Kiểm tra chọn theme, tải lại, khôi phục sáng/tối và lưu trữ không khả dụng nếu có thay đổi logic. Chạy kiểm tra phù hợp và xem giao diện thật; ghi rõ phần chưa kiểm tra. Giữ các lựa chọn và dữ liệu hiện có.
- Để tiết kiệm thời gian: sửa theo nhóm component dùng chung, tái sử dụng token và selector; chỉ kiểm tra lại phần bị ảnh hưởng sau mỗi thay đổi. Không tạo ảnh, cài thư viện hay viết lại bố cục khi không cần. Cập nhật PROGRESS và dừng tại checkpoint để duyệt.
