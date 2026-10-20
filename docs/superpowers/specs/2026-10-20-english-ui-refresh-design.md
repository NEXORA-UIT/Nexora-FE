# Thiết kế làm mới giao diện FE và chuyển sang tiếng Anh

## Bối cảnh

Nexora FE hiện có các luồng chính cho Auth, Workspace, Board, Card, Tasks, Calendar, Quick Notes, Profile và các trang giới thiệu. Giao diện đang dùng React, Tailwind và các component dùng chung như `Button`, `Input`, `Badge`; các màn hình chưa cùng mức hoàn thiện và còn nội dung tiếng Việt ở một số màn hình, thông báo, aria-label và lỗi.

`origin/staging` đã được fetch để rà soát. Nhánh làm việc hiện tại là `feature/core-feedback-implementation`, có nhiều thay đổi chưa commit từ các phần FE đang phát triển. Đợt làm mới sẽ tiếp tục trên working tree hiện tại và không ghi đè hoặc tự merge các thay đổi đó.

## Mục tiêu

- Làm giao diện nhất quán, rõ thứ bậc thông tin và dễ thao tác trên màn hình lớn lẫn màn hình nhỏ.
- Chuyển toàn bộ nội dung giao diện do ứng dụng cung cấp sang tiếng Anh, bao gồm nội dung hỗ trợ truy cập và trạng thái lỗi/thành công.
- Giữ nguyên luồng nghiệp vụ, API contract, dữ liệu và hành vi hiện có.
- Không bổ sung queue, Socket.IO, AI, RAG, Agent hoặc bộ chọn ngôn ngữ.

## Phạm vi màn hình

Áp dụng cho toàn bộ route FE:

- Landing page và các section giới thiệu.
- Đăng nhập, đăng ký, xác thực email, quên/đặt lại mật khẩu và OAuth callback.
- App shell, topbar, sidebar, dashboard và trạng thái chưa có dữ liệu.
- Danh sách Board, Board detail, Kanban, filter, planning, calendar và Card detail.
- Quản lý Board members, Workspace members, invitation và cấu hình GitHub.
- My Tasks, Workspace Calendar và Quick Notes.
- Profile, Settings, Help và Under Development.

Nội dung do người dùng hoặc dữ liệu dự án cung cấp — như tên, email, tên Workspace/Board/Card, comment, Quick Note và nội dung Git Activity — được giữ nguyên. Tên riêng trong dữ liệu demo không bị dịch.

## Hướng thiết kế

### Ngôn ngữ và cấu trúc copy

Đây là giao diện English-only; không thêm `i18next` hoặc runtime chọn locale. Copy đặc thù của từng luồng nằm cạnh component tương ứng để dễ đọc và sửa. Những thông báo dùng chung hoặc quy tắc ánh xạ lỗi có thể được gom vào module nhỏ khi có nhiều nơi sử dụng; không tạo một lớp trừu tượng chứa toàn bộ câu chữ của ứng dụng.

Các chuỗi cần rà soát gồm tiêu đề, mô tả, nút, menu, placeholder, helper text, lựa chọn filter, xác nhận, toast, loading/empty/error state, `aria-label`, `title`, lỗi validation phía client và thông báo API được hiển thị cho người dùng. Ngày tháng hiển thị dùng định dạng tiếng Anh nhất quán.

### Quy tắc giao diện

Dùng lại palette, typography, radius, spacing và component primitives hiện có của Nexora. Chuẩn hóa page header (tiêu đề, mô tả, hành động chính), bề mặt nội dung, form label/error, dialog, trạng thái tải/lỗi/trống và hành vi responsive. Mỗi màn hình giữ cấu trúc phù hợp với nghiệp vụ: dashboard ưu tiên việc cần làm, Boards ưu tiên duyệt và tạo Board, Kanban ưu tiên không gian kéo thả, các trang danh sách ưu tiên tìm/lọc và thông tin dễ quét.

Giữ nguyên khả năng truy cập bàn phím, focus state, tên truy cập cho điều khiển biểu tượng, breakpoint và luồng kéo thả hiện tại. Không thay đổi quyền, validation nghiệp vụ hay thứ tự thao tác để đổi lấy giao diện.

### Lỗi và dữ liệu

API tiếp tục trả payload và error code như hiện tại. Khi hiển thị lỗi, FE dùng error code/status và thông tin field để tạo câu tiếng Anh đã biết; với lỗi chưa ánh xạ, hiển thị thông báo dự phòng tiếng Anh thay vì đưa nguyên văn tiếng Việt từ server vào UI. Không ghi đè thông tin người dùng nhập và không dịch dữ liệu động.

## Các khu vực triển khai

1. **Nền tảng giao diện:** app shell, topbar/sidebar, typography, page header và trạng thái dùng chung.
2. **Luồng Auth và public:** landing, login, register, verify, reset password, OAuth callback và trang lỗi/chưa phát triển.
3. **Core workspace:** dashboard, workspace/board switcher, workspace invitation/members, Boards, Board detail, Kanban, Board members và filter.
4. **Card và cộng tác:** Card detail, activity, comments, attachments, Git activity, GitHub config, planning/calendar.
5. **Công việc và tài khoản:** My Tasks, Workspace Calendar, Quick Notes, Profile và Settings.
6. **Rà soát copy:** thông báo validation, toast/confirm, aria-label/title, nội dung fallback và format ngày tháng trên mọi route.

Thứ tự trên giảm việc sửa cùng một component dùng chung ở nhiều màn hình. Luồng API và nghiệp vụ chỉ được chỉnh ở ranh giới trình bày khi cần ánh xạ thông báo.

## Kiểm thử và tiêu chí hoàn thành

- Test hiện có được cập nhật để xác nhận copy tiếng Anh và hành vi giao diện quan trọng; bổ sung test cho ánh xạ lỗi nếu có helper mới.
- Chạy lint, typecheck, toàn bộ Vitest và production build.
- Rà soát source production để tìm sót câu tiếng Việt; loại trừ tên riêng, dữ liệu người dùng/demo, test fixture và nội dung kỹ thuật không hiển thị.
- Smoke test các nhóm route đại diện ở desktop và viewport hẹp: Auth, Dashboard, Boards/Kanban, Workspace membership, Tasks, Calendar, Quick Notes, Profile/Settings.
- Không có thay đổi về endpoint, API schema, quyền truy cập hoặc nghiệp vụ.

## Ngoài phạm vi

- Thay đổi backend, database schema, API contract hoặc dữ liệu hiện có.
- Thêm queue, Socket.IO, AI, RAG, Agent hoặc chức năng mới.
- Hỗ trợ song ngữ hoặc chuyển ngôn ngữ trong runtime.
- Dịch tên riêng và nội dung do người dùng tạo.
