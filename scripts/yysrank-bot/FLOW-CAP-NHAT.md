# Quy trình cập nhật dữ liệu (trạng thái 16/11/2026)

## Đội hình mẫu

1. Mở PowerShell trong thư mục này, chạy `npm install` một lần (cần Node.js và Microsoft Edge).
2. Chạy `node collector.cjs --full` để xuất JSON và CSV trong `output/` cho người dùng duyệt. `--dry-run` không ghi file. Mặc định không thay dữ liệu website.
3. Xem thay đổi bằng `git diff -- curated/yysrank-top20.json`, kiểm tra trang local và thay đổi thứ hạng/đội trước khi commit và push lên nhánh GitHub Pages. Không tự động push.
4. Chỉ khi muốn cập nhật 20 đội đầu, chạy `node collector.cjs --apply`. `--full --apply` chỉ ghi khi dữ liệu đạt kiểm tra; cần sửa giao diện trước khi đăng nhiều đội. Ngày 16/11 nguồn báo 684 đội nhưng trả 693 dòng, một dòng chứa thức thần chưa khớp catalog, vì vậy bản xuất chỉ dùng để duyệt. Các con số xếp hạng thể hiện thống kê của bộ lọc tại nguồn, không tự nhận định là tier/trend.

## Thức thần và ngự hồn từ Thức Thần Lục

1. Chạy `C:/Users/VanAnh/.gemini/antigravity/scratch/ecommerce_scraper_demo/CHAY_CAO_THUCTHANLUC.bat`; bot ghi snapshot vào thư mục `thucthanluc_data` cạnh nó. Kiểm tra log để biết tải thành công hay lỗi; không suy ra đã cập nhật website.
2. Website sử dụng dữ liệu riêng trong `data/`. `scripts/import_data.py --source <thu_muc_snapshot> --output data --dry-run` thử nhập; chạy lại không có `--dry-run` sẽ ghi dữ liệu. Importer kiểm tra cấu trúc kỹ năng và tính số lượng từ snapshot thay vì yêu cầu cố định 851.
3. Khi import thành công, kiểm tra danh mục, skill, ngự hồn, ID mới, sự thay đổi và test trước khi commit/push. Danh mục mới trên website cần được đối chiếu tên/ID với nguồn đội hình trước khi chạy lại bot đội.

## Đánh giá và đề xuất ngự hồn

1. Sau khi có snapshot thức thần, chạy `node scrape_community.js` tại thư mục scraper cũ để lấy reviews và đề xuất ngự hồn vào snapshot riêng. Không dùng `--from-cache` nếu muốn tải mới.
2. Dashboard local tại `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/team-community/rank-dashboard/` có thể cào, so sánh, duyệt và nhập ngự đề xuất vào `community/recommendations.json`. Chỉ các trường dùng để hiển thị được nhập; không đưa ID tài khoản lên website. Đánh giá `community/reviews.json` không được cập nhật bởi luồng này.
3. Kiểm tra các mục mới/thay đổi/không còn ở nguồn và thử hiển thị. Dashboard không tự commit hoặc xuất bản Thức Thần Lục.

## Giới hạn hiện tại

Không có lịch tự chạy, tự push hoặc nhận biết trend tăng/giảm giữa các kỳ. Muốn có trend cần lưu ít nhất hai snapshot cùng bộ lọc, đối chiếu đội theo thành phần thức thần thay vì theo hạng và ghi rõ thời điểm của từng kỳ. GitHub Pages chỉ cập nhật khi file đã được đẩy lên nhánh được chọn để xuất bản.
