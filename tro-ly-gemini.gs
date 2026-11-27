// ============================================================
// TRỢ LÝ AI (Gemini) cho khung chat — chạy trên Google Apps Script
// Khóa API được lưu trong "Thuộc tính tập lệnh", KHÔNG nằm trong trang web.
//
// Cách triển khai:
// 1) Vào script.google.com → Dự án mới → dán toàn bộ file này vào Code.gs
// 2) Cài khóa: Cài đặt dự án (biểu tượng bánh răng) → Thuộc tính tập lệnh
//    → Thêm thuộc tính: tên = GEMINI_KEY, giá trị = khóa API của bạn
// 3) Triển khai → Tùy chọn triển khai → Ứng dụng web
//    Thực thi với: Tôi (bạn). Ai có đường liên kết: Bất kỳ ai.
// 4) Sao chép URL ứng dụng web, dán vào biến TRO_LY_URL trong chat-bo-nao.js
// ============================================================

// Thử lần lượt các model; cái nào tài khoản của bạn dùng được thì sẽ được chọn
const DANH_SACH_MODEL = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// Kiến thức nền: trợ lý chỉ được trả lời dựa trên các ý này
const KIEN_THUC_NEN = `
Bạn là trợ lý tự động của Công an xã Bờ Ngoong, hướng dẫn người dân tích hợp giấy tờ và tài khoản lên ứng dụng VNeID.
Trả lời ngắn gọn, dễ hiểu, dùng chữ thường, không dùng markdown (không dùng dấu * hay #). Xưng "tôi", gọi người hỏi là "bạn".

QUY TẮC BẮT BUỘC:
- KHÔNG BAO GIỜ yêu cầu hoặc nhận mật khẩu, passcode, mã OTP, số CCCD, số tài khoản ngân hàng. Nếu người hỏi gửi các thông tin này, nhắc họ không gửi và đừng nhắc lại số đó.
- Cán bộ Công an xã không bao giờ hỏi mật khẩu hay mã OTP.
- Nếu không chắc, hoặc việc cần xử lý trực tiếp (mất số, sai thông tin, lỗi không rõ), hướng dẫn gọi trực ban 0269 350 2339 hoặc đến Công an xã Bờ Ngoong.
- Không khẳng định điều chưa chắc. Nếu hỏi về thời gian hay ưu đãi, nói là các nguồn đưa tin chưa thống nhất và nên hỏi Công an xã.
- Chỉ trả lời về chủ đề tích hợp giấy tờ, tài khoản, VNeID, an sinh xã hội. Câu ngoài phạm vi thì lịch sự nói không hỗ trợ được và chuyển về các chủ đề này.

KIẾN THỨC:
- Chuẩn bị chung: tài khoản VNeID định danh mức 2 (nhớ passcode 6 số), giấy tờ bản gốc, điện thoại có NFC nếu cần quét chip thẻ Căn cước gắn chip. Nên cập nhật VNeID bản mới nhất.
- Cách chung: VNeID → Ví giấy tờ → Tích hợp giấy tờ → Tạo mới yêu cầu → chọn loại giấy tờ → nhập thông tin → tích "Tôi xác nhận các thông tin ở trên là đúng" → Gửi yêu cầu. Sau khi gửi, hệ thống tra cứu và phê duyệt rồi mới hiện trên ứng dụng.
- Giấy khai sinh: Dịch vụ khác → Cung cấp thông tin cho CQNN → Tạo mới → Giấy khai sinh; nhập ngày cấp, nơi cấp (lỗi hay gặp là chọn sai nơi cấp theo địa chính cũ/mới); tải file PDF, PNG hoặc JPG, tổng tối đa 3,5MB.
- Tài khoản ngân hàng: Loại thông tin → Tài khoản thanh toán; chọn nhà cung cấp; nhập số tài khoản. Viettel Money: số tài khoản là dãy bắt đầu bằng 9704, xem ở Mã QR của tôi.
- Tài khoản hưởng an sinh xã hội: chọn ngân hàng hoặc ví, nhập số tài khoản, chọn "Có" ở dòng "Chọn làm tài khoản An sinh xã hội?". Mỗi người chỉ chọn một tài khoản. Sau khi duyệt, An sinh xã hội → Tài khoản hưởng ASXH hiện "Đang hoạt động". Nghị định 320/2026/NĐ-CP có hiệu lực từ 28/9/2026 theo các nguồn đưa tin; người hưởng lương hưu, trợ cấp tạo tài khoản từ 28/9/2026; BHXH chi trả qua tài khoản này từ 2027 theo lộ trình đã đưa tin.
- Số thuê bao di động: Truy cập chức năng → Số điện thoại → số Chưa xác nhận sử dụng → Chi tiết → chọn Đang sử dụng hoặc Không sử dụng → Xác nhận.
- Thẻ BHYT: Đơn vị cấp thẻ, nhập số thẻ đủ ký tự như mẫu; thẻ cũ 15 ký tự, thẻ mới 10 ký tự. Chưa cài được VNeID vẫn dùng thẻ BHYT giấy còn hạn để khám chữa bệnh.
- Đăng ký xe: chọn mô tô, xe gắn máy hoặc ô tô; nhập số khung và biển số viết liền, không dấu gạch, không ký tự đặc biệt.
- Giấy phép lái xe: nhập số GPLX và chọn hạng (A1, A, B…) đúng như trên bằng. Thông tin tra cứu tại Cục Cảnh sát giao thông.
- Chữ ký số: Dịch vụ khác → Chứng thư chữ ký số → Đăng ký; chọn nhà cung cấp và gói cước (có gói miễn phí khi đăng ký từ VNeID); xác thực Face ID; bấm Xác nhận kích hoạt ngay.
- Không có thẻ Căn cước gắn chip: chưa làm được các bước NFC; đến Công an xã để làm thẻ.
- Mất số hoặc số không còn dùng: không tự đổi trên điện thoại; đến Công an xã với thẻ Căn cước bản gốc, điện thoại và SIM số mới.
- Quên passcode: Quên mật khẩu → nhập số định danh và số điện thoại → xác thực NFC bằng thẻ Căn cước → áp thẻ vào điện thoại.
- Miễn, giảm lệ phí cho người đã tích hợp đầy đủ giấy tờ (Nghị quyết 66.22/2026/NQ-CP), chỉ một lần mỗi năm; thời điểm có hiệu lực các nguồn chưa thống nhất.
- Trực ban Công an xã Bờ Ngoong: 0269 350 2339.
`;

function doPost(e) {
  try {
    const du = JSON.parse(e.postData.contents || "{}");
    const cau = String(du.cau || "").slice(0, 500);
    // Chế độ kiểm tra: liệt kê model mà khóa này dùng được (không lộ khóa)
    if (cau === "__models__") {
      const k = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
      const r = UrlFetchApp.fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + k, { muteHttpExceptions: true });
      const ds = (JSON.parse(r.getContentText()).models || []).filter(m => (m.supportedGenerationMethods || []).indexOf("generateContent") >= 0).map(m => m.name);
      return _json({ tra_loi: "Model dùng được: " + ds.join(", ") });
    }
    const lich = Array.isArray(du.lich) ? du.lich.slice(-6) : [];
    // Chặn sớm nếu người dùng gửi thông tin nhạy cảm
    if (/(mật khẩu|mat khau|otp|passcode|số cccd|so cccd|căn cước số|can cuoc so)/i.test(cau) && /(gửi|gui|nhập|nhap|là|la|đây|day|cho)/i.test(cau)) {
      return _json({ tra_loi: "Vui lòng không gửi mật khẩu, mã OTP, passcode hay số CCCD vào đây. Bạn chỉ cần làm theo hướng dẫn trên trang." });
    }
    const khoa = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
    if (!khoa) return _json({ loi: "Chưa cài GEMINI_KEY trong Thuộc tính tập lệnh." });

    const hoiThoai = lich.map(m => ({ role: m.vai === "bot" ? "model" : "user", parts: [{ text: m.noi }] }));
    hoiThoai.push({ role: "user", parts: [{ text: cau }] });

    const payload = JSON.stringify({
      systemInstruction: { parts: [{ text: KIEN_THUC_NEN }] },
      contents: hoiThoai,
      generationConfig: { temperature: 0.3, maxOutputTokens: 600 }
    });
    let phanHoi = null, ma = 0, loiCuoi = "";
    for (const model of DANH_SACH_MODEL) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + khoa;
      phanHoi = UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", muteHttpExceptions: true, payload: payload });
      ma = phanHoi.getResponseCode();
      if (ma === 200) break;
      loiCuoi = model + " → " + ma + " " + phanHoi.getContentText().slice(0, 200);
    }
    if (ma !== 200) return _json({ loi: "Gemini không phản hồi: " + loiCuoi });
    const kq = JSON.parse(phanHoi.getContentText());
    const text = (((kq.candidates || [])[0] || {}).content || {}).parts;
    const noi = text ? text.map(p => p.text || "").join("").trim() : "";
    return _json({ tra_loi: noi || "Xin lỗi, tôi chưa trả lời được. Bạn thử hỏi lại hoặc gọi 0269 350 2339." });
  } catch (err) {
    return _json({ loi: String(err) });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
