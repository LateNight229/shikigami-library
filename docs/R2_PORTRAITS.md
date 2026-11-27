# Kho ảnh thức thần trên Cloudflare R2

## Chuẩn bị tài khoản

1. Kích hoạt R2 trong Cloudflare Dashboard (Storage & databases → R2). Đọc chi phí và hoàn tất đăng ký nếu Cloudflare yêu cầu.
2. Tạo bucket Standard riêng, ví dụ `shikilib-portraits`; chỉ dành cho ảnh được phép công khai. Bucket không công khai mặc định.
3. Để thử nghiệm, bật Public Development URL ở Settings và ghi lại URL. `r2.dev` bị giới hạn tốc độ và không dùng cho production.
4. Cho production, kết nối một subdomain thuộc domain do bạn quản lý trên Cloudflare trong mục Custom Domains, ví dụ `images.example.com`. Không trỏ CNAME đến r2.dev.

## Chuẩn bị ảnh

- Xác minh quyền thu thập và đăng lại; lưu nguồn và thời điểm lấy, không mặc định ảnh có đủ cho mọi thức thần.
- Dùng ID duy nhất làm tên, ví dụ `portraits/612.png`; kiểm tra nội dung, kích thước và độ phủ trước khi tải lên. Giữ bản gốc và so sánh chất lượng trước khi chọn phiên bản tối ưu.
- Không commit token, thông tin đăng nhập hay ảnh hàng loạt vào repo. Chỉ công khai nội dung được chủ tài khoản cho phép.

## Thử tải lên

- Wrangler có thể đăng nhập trực tiếp bằng trình duyệt mà không cần đưa API key vào chat. Kiểm tra đúng tài khoản và bucket trước khi upload.
- Dùng một file ảnh được phép, thử `npx wrangler r2 object put shikilib-portraits/portraits/612.png --file <duong-dan-anh> --content-type image/png --remote` (thay tên bucket và đường dẫn).
- Mở URL công khai tương ứng, kiểm tra file, content-type, ảnh trong trang và cache. Chỉ sau đó mới chuẩn bị nhập hàng loạt và phương án kiểm tra, chạy lại khi lỗi.
- R2 thu phí theo dung lượng và số thao tác nếu vượt hạn mức; kiểm tra cài đặt thanh toán, cảnh báo và chi phí thực tế trước khi nhập nhiều file.

## Nguồn tham khảo

- https://developers.cloudflare.com/r2/get-started/
- https://developers.cloudflare.com/r2/get-started/cli/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/r2/pricing/
