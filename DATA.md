# Dữ liệu thư viện

Nguồn là snapshot do người dùng cung cấp từ `thucthanluc_data`, nguồn tham khảo thucthanluc.io.vn. `data/manifest.json` ghi SHA-256 các file đầu vào; snapshot chưa được đối chiếu độc lập với bản game hiện tại. Dẫn nguồn trên giao diện. Kiểm tra quyền sử dụng và ảnh trước khi xuất bản công khai.

- `shikigami-catalog.json`: 270 bản ghi, tên VI/EN/ZH, ID, rarity, stat để lọc/sort phía client.
- `shikigami/{id}.json`: 270 file chi tiết, 851 skill (giữ thứ tự và biến thể kể cả ID skill trùng), 2.953 dòng nâng cấp. `stats` chứa `value` dạng số, `grade` riêng và `unit`; phần trăm lưu theo đơn vị điểm phần trăm: 10% là 10, không phải 0.1. Giá trị thiếu là `null`.
- `souls.json`: 70 ngự hồn, VI/EN/ZH khi có; trường trống không được suy đoán. `glossary.json`: 526 thuật ngữ, giao diện thay token biết được bằng tên Việt, giữ nguyên token không biết.
- Chưa có dữ liệu đề xuất ngự hồn theo từng thức thần, cách chơi/đánh giá hoặc hình ngự hồn trong bộ được nhập. UI để trống build/guide, dùng biểu tượng tạm cho ngự hồn. Ảnh thức thần và icon kỹ năng lấy từ CDN chính thức, chưa test đủ toàn bộ.
- 851/851 mô tả VI có nội dung trong snapshot, không đồng nghĩa chính xác hoặc cập nhật. Level max thể hiện giới hạn nâng cấp; mô tả được hiển thị nguyên trạng nguồn, không cam kết đã gộp mọi hiệu ứng cấp tối đa.
- Để mở rộng đội hình sau: dùng `id` thức thần và `id` ngự hồn làm tham chiếu; không dùng tên hiển thị làm khóa, không sửa record gốc cho loadout người dùng. Chỉ số số/grade đã sẵn sàng cho bộ lọc và sort. Sort/team/loadout chưa được triển khai.

## Nhập lại

```powershell
python scripts/import_data.py --source 'C:/Users/VanAnh/.gemini/antigravity/scratch/ecommerce_scraper_demo/thucthanluc_data' --output data --dry-run
python scripts/import_data.py --source 'C:/Users/VanAnh/.gemini/antigravity/scratch/ecommerce_scraper_demo/thucthanluc_data' --output data
python -m unittest discover -s tests -v
node --check app.js
```

Script đọc JSON raw thay vì CSV vì raw giữ cấu trúc 2.953 dòng nâng cấp. Không sửa file gốc; đầu ra không chứa đường dẫn máy cá nhân. Trước khi chạy trên snapshot khác, kiểm tra thay đổi ID và file cũ vì script không tự xóa file chi tiết cũ ngoài catalog; ứng dụng chỉ truy cập ID trong catalog. Hiện script kiểm tra số skill bằng 851, nên snapshot có số lượng mới cần cập nhật quy tắc kiểm tra một cách có chủ ý.
