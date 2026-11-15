# Bàn giao website thư viện thức thần

- Repo làm việc chính: `E:/1_Github/shikigami-library`, remote `https://github.com/LateNight229/shikigami-library.git`, nhánh `feat/website-bootstrap`. Chưa commit/push/publish.
- Website tĩnh HTML/CSS/JS, thiết kế cho GitHub Pages. Tin tức để sau; không làm Âm Dương Sư, Khiết linh, donate, đánh giá cộng đồng hoặc gửi đề xuất. Sort đồ sẽ bàn sau.
- Danh mục thức thần 278 bản ghi API CN lấy ngày 15/11/2026; chỉ #390 và #612 có mẫu kỹ năng. #390 có mô tả cơ bản dịch thủ công, tên/cấp chỉ số theo ảnh người dùng cần đối chiếu. Chưa hoàn thiện dữ liệu tiếng Việt, chỉ số, ngự hồn, hướng dẫn và đánh giá.
- Ảnh lớn từ CDN NetEase, có fallback icon; cần xem xét quyền sử dụng trước khi xuất bản. Bài guide Kamigame #390 có cảnh báo ngừng cập nhật năm 2025. Không sao chép hàng loạt đánh giá từ website tham khảo.
- UI: 3 panel chiếm chiều ngang, danh mục thu gọn phủ cột hình, panel hình/chỉ số không cuộn, panel nội dung cuộn; palette hồng. Chưa kiểm tra đủ kích thước desktop/mobile hoặc toàn bộ ảnh.
- Cách xem: từ repo chạy `python -m http.server 8768 --bind 127.0.0.1`, mở `http://127.0.0.1:8768/`. Kiểm tra cú pháp `node --check app.js`. Không mở `index.html` trực tiếp vì trang fetch JSON.
- Tiếp theo: duyệt giao diện và hoàn thiện nguồn dữ liệu có provenance, kiểm thử ảnh, thu thập/dịch chỉ số, skills và ngự hồn. Không công bố tự động nếu chưa xác minh độ chính xác/quyền. Chưa cấu hình GitHub Pages.
- Repo cũ `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji` giữ bot news và bản snapshot; website từ nay cập nhật tại repo này. Không tự push/merge khi chưa được yêu cầu.

## Checkpoint nhập dữ liệu — 15/11/2026
- Nhánh làm việc feat/add-all-data. Đã nhập 270 thức thần, 851 skill, 70 ngự hồn, 526 glossary từ snapshot người dùng; xem DATA.md để tái tạo và biết giới hạn.
- Đã nối giao diện: tìm VI/EN/ZH, chỉ số + grade, skills + upgrades và 70 ngự hồn. Chưa có ảnh ngự hồn, build theo thức thần hoặc guide được xác minh. Không làm sort/team/đề xuất cộng đồng/news ở lượt này.
- Dữ liệu chuẩn hóa gồm ID ổn định, stat value dạng số, grade, đơn vị percent; sẵn sàng để thiết kế sort/team/loadout sau. Kiểm tra snapshot chưa đồng nghĩa xác minh game hiện tại.
- Trạng thái chưa commit/push/publish. Các mốc nhánh/đếm trước đó ở trên là lịch sử, thay bằng checkpoint này khi tiếp tục.

## Checkpoint sắp xếp thức thần — 16/11/2026
- Nhánh feat/add-sort. Danh mục có chọn Máu, Công, Thủ, Tốc độ, Chí mạng, Sát thương chí mạng; tăng/giảm; đặt lại; số hiển thị cùng danh sách. Kết hợp tìm và lọc rarity, không dùng cho ngự hồn.
- So sánh số, % dùng số điểm phần trăm, thiếu giá trị xuống cuối và đồng điểm giữ thứ tự catalog. Trạng thái chỉ trong phiên, không lưu lâu dài; chưa lọc theo grade hoặc tạo team.
- Kiểm tra node tests/test_sort.cjs: pass; kiểm tra in-app HP tăng/giảm, kết hợp SP và ẩn menu khi xem ngự hồn: pass. Chưa commit/push; bản mẫu chờ người dùng duyệt.

## Checkpoint sửa danh mục, sort và ảnh — 16/11/2026
- Chọn thức thần bằng handler riêng trên danh sách, đóng danh mục và sort. Chọn trường sort, chiều sort hoặc đặt lại sẽ đóng menu sort; mở lại để chọn chiều khác.
- Ảnh nhỏ từ CDN được hiển thị trong lúc ảnh lớn tải; tải trước 2 nhân vật lân cận, giữ tối đa 8 lượt tải trong bộ nhớ. Ảnh vẫn phụ thuộc mạng/CDN; không khẳng định tốc độ tải mạng tăng hay kiểm thử đủ mọi ảnh.
- Kiểm tra in-app: chọn HP đóng menu, 3 kết quả đầu giảm dần; chọn một thức thần ẩn danh mục và aria-expanded=false; thấy ảnh nhỏ trước rồi ảnh lớn 830px. node --check và test_sort pass. Chưa commit/push/publish.

## Checkpoint next/previous theo kết quả — 16/11/2026
- Nút trước/sau dùng cùng danh sách sau tìm kiếm, lọc rarity và sort; vòng từ cuối về đầu. Nếu nhân vật hiện tại không thuộc kết quả thì next chọn đầu, previous chọn cuối; danh sách rỗng không đổi.
- Node test sort/neighbor pass. In-app: HP giảm dần #564 → #606, sau lọc SP #595 → #612 đúng. Chưa commit/push/publish.

## Checkpoint tạo đội — 16/11/2026
- Nhánh feat/create-team, chờ người dùng duyệt; chưa commit/push/merge. Thêm tab tạo đội 5 ô, chọn trùng, thêm/thay/xóa, tự lưu một đội trong localStorage theo origin. Bấm chọn trong danh mục hoặc ảnh trong đội để xem chỉ số cơ bản.
- Thứ tự dự kiến tính tốc cơ bản; cùng tốc được đánh dấu chưa xác định thứ tự. Không tính ngự hồn, hiệu ứng hay phe địch. Slot lưu ID, số liệu lấy từ catalog; có xử lý ID không tồn tại và lỗi storage.
- Kiểm tra node --check app.js/team.js và node tests/test_sort.cjs pass. Trình duyệt đã thử thêm một thức thần, bấm ảnh xem chỉ số, chọn trùng, cảnh báo cùng tốc, khôi phục sau reload. Chưa kiểm thử đầy đủ mobile và các biên; cần tiếp tục hoàn thiện theo phản hồi.
- Xem thử: python -m http.server 8770 --bind 127.0.0.1; mở http://127.0.0.1:8770/. Chưa triển khai news hoặc gắn ngự hồn.

## Cập nhật bố cục tạo đội — 16/11/2026
- Tab tạo đội luôn mở danh mục bên trái, 5 ô một hàng, màn hình hẹp cuộn ngang. Thông tin nhanh xuất hiện khi rê chuột vào avatar danh mục hoặc đội; focus và chạm có hỗ trợ.
- Kiểm tra cú pháp JS và test sort pass; kiểm tra trực quan viewport khoảng 796px và mở/đóng bảng chỉ số bằng focus. Chưa kiểm thử thao tác rê thực tế hoặc thiết bị cảm ứng. Chưa commit/push/merge.

## Cập nhật đội dự bị — 16/11/2026
- Thêm 5 ô dự bị độc lập; chọn ô trước rồi chọn thức thần, không đưa dự bị vào thứ tự hành động. Đội đã lưu bản 5 ô được đọc tương thích; lưu bản 10 ô. Nút ba gạch mở tab mới ?hero=ID, app chọn đúng thức thần khi tải.
- Thu hẹp panel tốc và dàn 5 ô mỗi hàng; màn rất hẹp có thể cuộn ngang. Kiểm tra trình duyệt: thêm thức thần vào ô 6 không thêm vào thứ tự hành động; mở tab mới hiển thị đúng #593. node --check app.js/team.js và node tests/test_sort.cjs pass; chưa kiểm thử mobile toàn diện. Chưa commit/push/merge.

## Chế độ sáng/tối — 16/11/2026
- Nút cạnh tìm kiếm chuyển light/dark, ghi nhớ trong localStorage theo origin; không có storage thì dùng trong phiên. Bảng màu tối riêng cho thức thần, kỹ năng, danh mục, ngự hồn, tạo đội, tooltip và sort.
- Kiểm tra trực quan dark ở 3 tab tại viewport ~796px, nút không bị cắt, reload giữ dark; node --check theme.js và node tests/test_sort.cjs pass. Chưa kiểm thử mobile toàn diện. Nhánh feat/create-team; chưa commit/push/merge.

## Đánh giá và ngự hồn đề xuất — 16/11/2026
- Nhánh feat/create-team, đã nối 126 review và 209 đề xuất của 83 thức thần từ dữ liệu người dùng đã cào. Snapshot nằm community/reviews.json và community/recommendations.json; không đưa user_id vào website. Nguồn, ngày, độ tin cậy theo nguồn được hiển thị; không có dữ liệu thì báo trống, lỗi tải báo riêng.
- Trình duyệt: #200 hiển thị đề xuất và trạng thái không review, #593 hiển thị review/điểm/nguồn ở chế độ tối. node tests/test_community.cjs và node tests/test_sort.cjs pass. Chưa kiểm thử toàn bộ record và mobile. Snapshot chưa tự cập nhật; nguồn và nội dung chưa xác minh độc lập, quyền sử dụng cần xem xét trước xuất bản.
- Chưa commit/push/merge/publish; dừng chờ người dùng duyệt.

## Mốc đội cá nhân — 16/11/2026
- Đang triển khai/chờ duyệt trên feat/create-team: tên, ghi chú, loại đội, swap giữa 10 ô, danh sách Đội hình của tôi, lưu nhiều đội local và xuất/nhập JSON; giữ đội cũ qua migration. Chưa làm cộng đồng, like, admin hay cloud/đội mẫu.
- node tests/test_team_store.cjs, tests/test_sort.cjs, tests/test_community.cjs pass; trình duyệt đã thử nhận đội cũ và di chuyển ô 1 sang ô 2, thanh tốc thay đổi. Chưa thử đầy đủ lưu nhiều đội, xuất/nhập, mobile và lỗi storage trên trình duyệt; cần hoàn thiện kiểm tra trước khi kết luận done. Chưa commit/push/merge.

## Sửa swap và thông báo lưu — 16/11/2026
- Chọn hai ô để sáng; chọn ô thứ ba bỏ ô đầu, nút Swap giữa hai hàng hoặc phím Space thực hiện đổi, hỗ trợ ô trống. Thông báo lưu gần nút lưu; thu gọn header và sửa danh mục che nội dung màn hẹp.
- Đã thử nút Swap, Space, lưu thành công và tên trống trên trình duyệt; node tests/test_team_store.cjs, test_sort.cjs, test_community.cjs pass. Dữ liệu thử 'Đội thử swap' lưu trong trình duyệt origin localhost:8770. Chưa kiểm tra lỗi storage thực tế, cảm ứng/mobile toàn diện; chưa commit/push.
