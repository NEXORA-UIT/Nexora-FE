# Kế hoạch tổng thể hoàn thiện FE cho demo

Spec được duyệt: [2026-10-20-demo-ready-fe-design.md](../specs/2026-10-20-demo-ready-fe-design.md)

Phạm vi có bốn phần độc lập; triển khai theo thứ tự để route và data source có sẵn trước khi sửa điều hướng:

1. [Workspace Overview và Settings](2026-10-20-workspace-demo-pages.md)
2. [Knowledge Base, Help và 404](2026-10-20-knowledge-help-pages.md)
3. [App shell, dashboard và điều hướng demo](2026-10-20-dashboard-demo-navigation.md)
4. [Đồng bộ giao diện các màn Core](2026-10-20-core-screen-visual-refresh.md)

## Quy tắc thực thi chung

- Làm từng kế hoạch theo thứ tự trên; mỗi phần phải tự chạy được test trước khi chuyển sang phần kế tiếp.
- TDD theo từng hành vi: test thất bại, cài đặt tối thiểu, test qua.
- Không sửa backend, API contract, database schema, migration, queue, Socket.IO hoặc luồng AI.
- Knowledge Base/Help chỉ đọc; dữ liệu Knowledge Base luôn có nhãn `Demo content`.
- Working tree hiện có thay đổi Board/Card/Workspace chưa commit. Không reset, checkout đè, hoặc đưa các thay đổi đó vào commit ngoài phạm vi; rà staged diff trước mọi commit.
- Khi hoàn tất cả bốn phần, chạy `npm test`, `npm run lint`, `npm run typecheck` và `npm run build` trong `frontend/`.
