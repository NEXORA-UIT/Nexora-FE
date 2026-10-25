# Thiết kế chuẩn hóa dialog và modal trong Nexora

## Mục tiêu

Rà soát và làm đồng nhất toàn bộ dialog/modal trong FE để dễ đọc, gọn, dùng tốt trên màn hình nhỏ và hỗ trợ bàn phím. Ưu tiên xử lý Board members modal trong ảnh: header đang chật khiến nút sao chép xuống dòng, phần thông tin dài và các lớp menu/dialog chưa tách biệt rõ.

## Phạm vi

Chuẩn hóa 12 dialog/drawer hiện có:

1. Board members và quyền truy cập.
2. Board settings.
3. Tạo Board.
4. Tạo Workspace.
5. Xác nhận xóa Board.
6. Đổi URL ảnh đại diện.
7. Xác nhận đăng xuất.
8. GitHub Connector.
9. Thêm dependency.
10. Danh sách thẻ trong ngày trên Calendar.
11. Xác nhận xóa Card.
12. Card detail drawer.

Không thay đổi API, schema, quy tắc quyền hay hành vi nghiệp vụ. Drawer chi tiết Card vẫn trượt từ cạnh phải; chỉ đồng bộ khung, lớp phủ, tiêu đề và hành vi trợ năng với dialog còn lại.

## Hướng thiết kế được chọn

Tạo bộ primitive dùng chung trên Radix Dialog, gồm overlay, content có biến thể kích thước, header, phần nội dung cuộn và footer hành động. Chuyển các modal tự dựng sang primitive này để có cùng cách khóa tương tác nền, quản lý focus, đóng bằng Escape và xử lý lớp phủ. Giữ nội dung và callback nghiệp vụ hiện tại.

### Các hướng đã cân nhắc

- Chỉnh riêng từng modal: ít refactor lúc đầu nhưng tiếp tục tạo khác biệt về spacing, cuộn, đóng và accessibility.
- Tạo primitive chung và áp dụng cho cả 12 dialog/drawer: cần sửa nhiều component hơn nhưng cho trải nghiệm thống nhất và ngăn lỗi lặp lại. Đây là hướng được chọn.

## Quy tắc trình bày

- Header có tiêu đề, mô tả ngắn tùy chọn và một nút đóng; các action phụ như Copy link không ép tiêu đề xuống dòng.
- Body có khoảng cách nhất quán, chiều cao tối đa theo viewport và vùng cuộn riêng nếu nội dung dài.
- Footer có vị trí ổn định; nút chính/phụ dễ phân biệt và không bị cuộn khỏi tầm nhìn khi form dài.
- Dialog có kích thước theo tác vụ (nhỏ/xác nhận, vừa/form, rộng/quản lý); mobile dùng gần toàn màn hình với lề an toàn.
- Có focus trap, focus ban đầu hợp lý, focus quay lại nút mở, Escape và click nền theo đúng loại hành động. Không cho đóng khi đang submit/xóa nếu điều đó có thể làm mất trạng thái thao tác.
- Dùng lớp phủ và z-index nhất quán để menu nền không còn trông như một dialog đang hoạt động khi modal mở.
- Tôn trọng `prefers-reduced-motion`; animation ngắn, chỉ dùng opacity/transform.

## Tab cho modal nhiều thông tin

Board members được tách thành hai tab:

- **Access & roles**: Workspace Owner, Board PM, quy tắc quyền và thao tác phân công PM (chỉ Owner).
- **Members**: thêm thành viên, danh sách người có quyền vào Board và thao tác xóa.

Đây là modal duy nhất hiện đủ dày để cần tab. Các modal tạo/sửa, xác nhận, chọn dependency và Calendar giữ một màn hình; chỉ tách tab nếu khi áp layout mới, các nhóm thông tin độc lập vẫn làm dialog dài hoặc khó quét.

## Tiêu chí nghiệm thu

- Cả 12 dialog/drawer dùng chung quy tắc shell, responsive, cuộn và lớp phủ.
- Board members header không wrap nút Copy board link; hai tab phân chia rõ quyền và thành viên.
- Modal không để menu nền tiếp tục nhận focus/tương tác; keyboard và đóng/mở hoạt động nhất quán.
- Giữ nguyên callback, API, quyền và dữ liệu của các luồng hiện tại.
- Test FE liên quan, typecheck, lint và production build qua.
