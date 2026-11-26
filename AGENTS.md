# Hướng dẫn chung

- Repo này là website Shikigami Library và các bot liên quan. Chỉ đọc tài liệu và code liên quan đến tác vụ; không mặc định quét toàn repo, ảnh, log hoặc lịch sử.
- Không đọc/duyệt để lấy ngữ cảnh hoặc sửa `.venv/`, `logs/`, `.env`, `__pycache__/`, `data/` là dữ liệu runtime. Được chạy interpreter, dependency đã khai báo và các lệnh kiểm tra dự án; không sửa tay thư viện trong `.venv`. Không log hoặc hardcode secret.
- Kiểm tra branch, status và remote trước khi đổi nhánh; giữ các thay đổi chưa commit. Mỗi việc làm trên nhánh `feat/...` hoặc `fix/...`.
- Không push hoặc merge nếu người dùng chưa cho phép. Yêu cầu push không đồng nghĩa cho phép merge; khi đã được phép trong phiên thì thực hiện đúng phạm vi, không hỏi lại.
- Chỉ báo kiểm tra đã pass khi thực sự chạy; nêu rõ giới hạn. Có đầu ra để duyệt thì dừng tại checkpoint, không tự chuyển milestone.
- Cập nhật mục bàn giao liên quan trong `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/docs/PROGRESS.md` trước checkpoint và khi kết thúc chat; chỉ đọc mục liên quan. Đây là tài nguyên local, kiểm tra tồn tại trên máy khác.

## Đọc theo tác vụ

- Website, kiểm tra và Git: `docs/WORKFLOW.md`.
- Bot đã có, bảng điều khiển PvP và Thức Thần Lục: `docs/BOTS.md`.
- Cào đội PvP: `scripts/yysrank-bot/README.md`; Kamigame: `scripts/kamigame-bot/README.md`.
- Milestone và thiết kế bot tin: chỉ đọc phần liên quan trong `C:/Users/VanAnh/Documents/ChatGPT/Bot_Onmyoji/docs/MILESTONES.md` và `docs/DESIGN.md` tại repo đó.
