# Thu thập Kamigame

Chạy `node collect.cjs --dry-run --limit 5` để thử không ghi file; `node collect.cjs` thu thập danh mục vào `output/kamigame-preview.json`. Có thể dùng `--limit N`, `--url URL`, `--repo PATH` hoặc `--output PATH`. Cần `playwright-core` và Edge; đặt script trong `scripts/kamigame-bot` và cài dependency khai báo của bot.

Output chỉ là bản duyệt. Kiểm tra coverage, errors, unmatched, rawRecords, ngày cập nhật, tên Nhật và ID trước khi chuyển thành snapshot website; không tự ghi đè file website. Ghép ngự theo từ điển hoặc tên Trung khớp duy nhất, không dùng link đích nguồn làm bằng chứng duy nhất. Ghép thức thần khắc chế theo bài đích đã ghép ID và xác minh nhãn trong tiêu đề; mục mạnh khi gặp suy ra đảo chiều. Dữ liệu nguồn đã cũ, không xem là meta hiện tại.

Yêu cầu tuân thủ robots.txt, điều khoản, giới hạn tốc độ và quyền sử dụng của nguồn; ngừng khi bị từ chối hoặc giới hạn. Không đưa nguyên văn mô tả dài vào website; đường dẫn nguồn và các mục chưa khớp được lưu cho người duyệt.
