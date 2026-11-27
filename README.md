# Hướng dẫn tích hợp tài khoản an sinh xã hội – Công an xã Bờ Ngoong

Trang hướng dẫn người dân:
1. Tích hợp tài khoản ngân hàng / ví lên ứng dụng VNeID để nhận tiền an sinh xã hội.
2. Lấy lại mật khẩu VNeID (có video).
3. Mở tài khoản ngân hàng online (38 ngân hàng / ví, có tờ PDF in được).
4. Liên hệ Công an xã khi mất số điện thoại VNeID.
5. Để lại thông tin để cán bộ gọi lại hỗ trợ (ghi vào Google Sheet qua Apps Script).

## Sửa nội dung
- `index.html` – phần `CAU_HINH` ở đầu đoạn `<script>`: link Web App, địa chỉ, số trực ban.
- `index.html` – mảng `VIDEOS`: thêm video YouTube.
- `banks.js` – thông tin từng ngân hàng (tên app, nút bấm, tổng đài, lưu ý).
- `pdf/` – tờ hướng dẫn in của từng ngân hàng.

Trang không lưu dữ liệu người dân; form hỗ trợ gửi thẳng vào Google Sheet của đơn vị.
