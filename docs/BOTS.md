# Bot và dữ liệu hiện có

## Đội hình PvP

- Bot tại `scripts/yysrank-bot/`; xem README trong thư mục này để biết cách cào, duyệt, áp dụng, kiểm tra và giới hạn. Mỗi bản nguồn mới được áp dụng tạo kỳ, giữ kỳ trước và đối chiếu hạng theo điều kiện trong README.
- Trên máy hiện tại, shortcut `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/CHAY_BOT/00_BANG_DIEU_KHIEN - Shortcut.lnk` chạy bảng điều khiển từ `team-community/rank-dashboard/` của repo Bot_Onmyoji. Đây là tài nguyên local không nằm trong repo website; kiểm tra tồn tại khi tái tạo.
- Bảng điều khiển cào đội và khắc chế, cho duyệt, áp dụng local, xem thử và có nút chủ động xuất bản. Nút xuất bản yêu cầu đã áp dụng trong phiên, nhánh `main`, không có file stage; commit `curated/yysrank-top20.json`, `curated/team-periods.json` và `curated/hero-counter-periods.json`, rồi push `origin/main`. Push thành công chưa chứng minh Pages đã build; không tự xuất bản khi chưa được phép.

## Thức Thần Lục

- Trên máy hiện tại, `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/CHAY_BOT/01_THUCTHANLUC.bat` và `02_DANHGIA_NGU.bat` chạy `scrape_thucthanluc.js` và `scrape_community.js` trong `C:/Users/VanAnh/.gemini/antigravity/scratch/ecommerce_scraper_demo/`.
- Hai launcher cũ xuất snapshot, không tự commit, push hoặc cập nhật website. Dashboard local có thể chạy hai scraper, so sánh và sau khi người dùng duyệt thì nhập thức thần và ngự đề xuất vào website local; không tự nhập đánh giá hoặc xuất bản. Xem `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/team-community/rank-dashboard/README.md`.
- Các launcher khác và chi tiết local: `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/CHAY_BOT/README.md`; tình trạng từng bot xem mục liên quan trong `docs/PROGRESS.md` của repo Bot_Onmyoji.
