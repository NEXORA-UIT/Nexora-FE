# Thiết kế FE sẵn sàng cho demo

## Mục tiêu

Giúp nhóm trình bày Nexora rõ ràng với giảng viên bằng các màn hình có nội dung, điều hướng đúng và thao tác được ở những luồng Core đã có. Làm giao diện giàu phân cấp và có điểm nhấn hơn, đồng thời giữ nguyên API, database schema và nghiệp vụ backend.

AI Assistant/AI Agents nằm ngoài phạm vi. Các màn AI hiện có thể giữ trạng thái chưa triển khai, nhưng phải ghi rõ trạng thái đó và không làm người dùng nhầm với một flow đang hoạt động.

## Phạm vi

### Màn hình và flow sẽ hoàn thiện

- App shell, dashboard, điều hướng và các CTA đang dẫn về trang `UnderDevelopmentPage` sẽ dẫn đến flow phù hợp đang có.
- Workspace Overview hiển thị thông tin workspace, board và thành viên từ dữ liệu thật; có lối tắt tới thao tác đã hỗ trợ.
- Workspace Members tiếp tục dùng panel membership hiện tại và được đưa vào luồng Workspace hoàn chỉnh.
- Workspace Settings cho phép Owner sửa tên, mô tả và danh mục qua API cập nhật workspace hiện tại. Kiểm tra vai trò, trạng thái archived/frozen và phản hồi loading, lỗi, thành công.
- Boards, Board detail, My Tasks, Calendar và Quick Notes được làm đồng bộ về phân cấp thị giác, khoảng cách, trạng thái rỗng và CTA. Giữ nguyên các thao tác nghiệp vụ và API hiện có.
- Knowledge Base là thư viện nội dung mẫu chỉ đọc, có nhãn `Demo content`, tìm kiếm, lọc theo danh mục và xem nội dung bài viết. Không tạo, sửa, xóa hoặc giả lập lưu nội dung lên server.
- Help & Docs là hướng dẫn sử dụng và FAQ tĩnh; liên kết đến các route Core đang chạy.
- Route không tồn tại có trang 404 riêng và đường quay về app, không hiển thị thông báo “Feature Under Development”.

### Ngoài phạm vi

- AI Assistant, AI Agents, RAG và mọi hành vi sinh nội dung.
- Thay đổi backend, API contract, database schema, migration, queue hoặc Socket.IO.
- Tạo hệ thống notification hoặc global search mới khi backend chưa có endpoint tương ứng.
- Thêm dependency UI hoặc hệ thống i18n runtime.

## Hướng thiết kế

Giữ React, Tailwind, component primitives và typography Inter hiện tại. Dùng nền app slate ấm, sidebar tối theo màu thương hiệu, điểm nhấn blue/indigo và cyan tiết chế, hierarchy chữ rõ, trạng thái badge có độ tương phản tốt. Tránh lặp lại các thẻ trắng giống nhau bằng cách phối hợp vùng tiêu đề có màu, nhóm chỉ số, danh sách có phân cấp, activity/context panels và empty states có CTA.

Workspace Overview ưu tiên một vùng nhận diện workspace, dải số liệu gọn và board gần đây. Knowledge Base có thanh tìm kiếm, danh mục, bài nổi bật và danh sách bài. Help có hero hướng dẫn, nhóm câu hỏi và quick links. Các layout phải hoạt động ở viewport hẹp, keyboard focus nhìn thấy được và không dựa vào màu sắc đơn thuần để truyền đạt trạng thái. Dùng CSS, SVG/icon và tài nguyên sẵn có; không thêm ảnh trang trí hay dependency.

## Dữ liệu và hành vi

- Số liệu cho workspace, boards, members, tasks và lịch lấy từ API hoặc state hiện có. Không đưa số liệu giả vào dashboard để tạo ấn tượng.
- Nội dung Knowledge Base mẫu được lưu trong fixture phía FE và luôn hiển thị nhãn `Demo content`; tìm kiếm và lọc chỉ thao tác trên dữ liệu mẫu cục bộ.
- FAQ/help là nội dung tĩnh, không gửi request mới.
- Workspace Settings gọi đúng `workspaceApi.updateWorkspace`; chỉ gửi các trường được người dùng thay đổi. UI tuân theo quyền Owner và trạng thái workspace; lỗi server được trình bày qua error mapper hiện có.
- CTA của dashboard, sidebar, topbar và landing page trỏ đến route hoặc thao tác đang có. Nút Create dẫn đến màn Boards/workspace nơi người dùng có thể tạo đối tượng được hỗ trợ. Không tạo cảm giác task, notification hoặc nội dung demo đã được lưu nếu backend chưa hỗ trợ.
- AI Assistant/Agents có trạng thái rõ ràng là chưa triển khai và không được giới thiệu như khả năng đang hoạt động.
- API errors, loading, empty và unavailable states dùng copy tiếng Anh, nhất quán với UI hiện tại.

## Các khu vực dự kiến thay đổi

- `src/layouts/AppLayout.tsx`, `src/components/navigation/*`, `src/components/dashboard/*` cho app shell, dashboard và điều hướng.
- `src/pages/boards/BoardsPage.tsx`, workspace components và types/hooks cần thiết cho Overview/Settings.
- `src/pages/knowledge/*`, `src/pages/help/*` và fixtures tương ứng cho nội dung demo chỉ đọc.
- `src/pages/NotFoundPage.tsx`, `src/routes.tsx` và route constants cho route 404 riêng.
- Các trang Board detail, Tasks, Calendar, Quick Notes khi cần đồng bộ hệ thống thị giác và điều hướng.

Đây là ranh giới dự kiến, không phải yêu cầu phải tạo mọi file nêu trên; triển khai sẽ ưu tiên tái sử dụng component và state hiện có.

## Tiêu chí nghiệm thu

1. Không còn đường đi người dùng phổ biến nào dẫn tới trang chung “Feature Under Development”, ngoại trừ trang AI được đánh dấu rõ ngoài phạm vi.
2. Workspace Overview, Members và Settings hiển thị đúng dữ liệu/quyền; Settings cập nhật thành công qua endpoint hiện có và hiển thị lỗi tiếng Anh nếu thất bại.
3. Knowledge Base có thể tìm, lọc và xem bài demo; nhãn demo luôn rõ; không có thao tác ghi giả.
4. Help & Docs cung cấp FAQ và liên kết điều hướng tới các flow Core đang hoạt động.
5. Các CTA trên dashboard và topbar không dẫn tới route chết; dữ liệu bảng/board hiển thị từ nguồn hiện có.
6. Các màn mới đáp ứng layout desktop/mobile, keyboard focus và các trạng thái loading/error/empty.
7. Không có thay đổi trong backend, API contract, schema, dependency hoặc luồng AI.
8. Typecheck, lint và test liên quan của frontend qua; kiểm tra production build và smoke các flow chính.

## Kiểm thử

- Component tests cho Workspace Overview/Settings, Knowledge Base search/filter/detail, FAQ/help, route 404 và CTA điều hướng.
- Mock API để xác minh quyền, request chỉ chứa trường đã sửa, trạng thái lỗi và loading; không thay đổi endpoint/payload contract.
- Chạy test liên quan đến workspace/board/task/calendar/notes và toàn bộ frontend suite.
- Chạy lint, typecheck, production build; smoke test luồng Workspace → Board → Card/Task, Calendar/Quick Notes, Membership và các route Help/Knowledge Base.
