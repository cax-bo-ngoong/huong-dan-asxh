// Bộ não trợ lý (bản xem trước, chưa triển khai)
// 1) Chuẩn hóa tiếng Việt (bỏ dấu) để bắt được cả câu không dấu
// 2) Từ khóa đồng nghĩa + chấm điểm nhiều chủ đề, chọn chủ đề điểm cao nhất
// 3) Nhớ chủ đề vừa nói để trả lời câu nối tiếp ("còn ô tô thì sao")
// 4) Chặn thông tin nhạy cảm; câu không hiểu thì gợi ý chủ đề

const KIEN_THUC = [
  { id: "chao", tu: ["chao", "alo", "hello", "xin chao", "cho hoi", "ban oi", "co the lam gi", "giup duoc gi", "lam duoc gi", "ban la ai"],
    dap: "Xin chào! Tôi là trợ lý tự động của <b>Công an xã Bờ Ngoong</b>. Tôi hướng dẫn bạn <b>tích hợp các loại giấy tờ lên VNeID</b>, mở tài khoản, hoặc lấy lại mật khẩu. Bạn muốn làm việc gì?",
    goi: ["Giấy khai sinh", "Tài khoản ngân hàng", "Đăng ký xe", "Giấy phép lái xe", "Thẻ BHYT"] },

  { id: "tong_quat", tu: ["giay to nao", "tich hop gi", "tich hop nhung gi", "loai nao", "danh muc", "nhung loai", "co nhung giay", "8 loai", "tam loai", "may loai"],
    dap: "Trong đợt này có <b>8 loại giấy tờ</b> được hướng dẫn tích hợp lên VNeID: <b>giấy khai sinh, tài khoản ngân hàng, tài khoản hưởng an sinh, số thuê bao di động, thẻ BHYT, đăng ký xe, giấy phép lái xe, chữ ký số</b>. Bạn muốn xem loại nào?",
    goi: ["Giấy khai sinh", "Tài khoản ngân hàng", "Tài khoản an sinh", "Số thuê bao", "Thẻ BHYT", "Đăng ký xe", "Giấy phép lái xe", "Chữ ký số"] },

  { id: "chuan_bi", tu: ["chuan bi", "can gi", "can co gi", "mang theo", "can nhung gi"],
    dap: "Chuẩn bị chung: <b>tài khoản VNeID định danh mức 2</b> (nhớ passcode 6 số), <b>giấy tờ bản gốc</b> để nhập đúng thông tin, và <b>điện thoại có NFC</b> nếu cần quét chip thẻ Căn cước. Nên cập nhật VNeID lên bản mới nhất trước khi làm.",
    goi: ["Tích hợp giấy khai sinh", "Tích hợp đăng ký xe"] },

  { id: "cach_chung", tu: ["cach tich hop", "lam the nao", "huong dan tich hop", "buoc tich hop", "tich hop the nao", "tich hop giay to the nao", "vi giay to", "tich hop giay to"],
    dap: "Cách chung: mở VNeID, nhập passcode, vào <b>Ví giấy tờ → Tích hợp giấy tờ</b>, bấm <b>Tạo mới yêu cầu</b>, chọn <b>loại giấy tờ</b>, nhập thông tin, tích <b>“Tôi xác nhận các thông tin ở trên là đúng”</b> rồi bấm <b>Gửi yêu cầu</b>. Bạn muốn làm loại nào?",
    goi: ["Giấy khai sinh", "Tài khoản ngân hàng", "Đăng ký xe", "Giấy phép lái xe", "Thẻ BHYT", "Số thuê bao", "Chữ ký số"], link: "#/tich-hop" },

  { id: "khai_sinh", tu: ["khai sinh", "giay khai sinh", "gks"],
    dap: "<b>Giấy khai sinh</b>: vào <b>Dịch vụ khác → Cung cấp thông tin cho CQNN → Tạo mới</b>, chọn <b>Giấy khai sinh</b>, nhập <b>ngày cấp</b> và <b>nơi cấp</b>, tải ảnh giấy khai sinh (PDF, PNG, JPG, tối đa 3,5MB), tích xác nhận rồi <b>Gửi yêu cầu</b>. Lỗi hay gặp nhất là <b>nơi cấp</b>: nên chọn theo địa chính đúng như trên giấy, có thể là cấp xã cũ hoặc cấp xã hiện tại.",
    goi: ["Ảnh quá dung lượng", "Nơi cấp chọn sao", "Báo sai thông tin"] },

  { id: "ngan_hang", tu: ["tai khoan ngan hang", "tai khoan thanh toan", "ngan hang", "nha cung cap", "so tai khoan", "viettel money", "mb bank", "vietcombank", "agribank", "bidv", "vi dien tu", "momo"],
    dap: "<b>Tài khoản ngân hàng</b>: chọn <b>Loại thông tin → Tài khoản thanh toán</b>, chọn <b>Nhà cung cấp</b> (ngân hàng hoặc ví), nhập <b>số tài khoản</b>, tích xác nhận rồi <b>Gửi yêu cầu</b>. Với Viettel Money, số tài khoản là dãy số bắt đầu bằng <b>9704</b>, xem trong ứng dụng ở mục Mã QR của tôi.",
    goi: ["Tài khoản an sinh", "Mở tài khoản mới"], link: "#/tich-hop" },

  { id: "an_sinh", tu: ["an sinh", "asxh", "tai khoan an sinh", "tai khoan huong", "chon lam", "nhan tien", "tien an sinh"],
    dap: "<b>Tài khoản hưởng an sinh xã hội</b>: chọn ngân hàng hoặc ví, nhập số tài khoản, rồi ở dòng <b>“Chọn làm tài khoản An sinh xã hội?”</b> chọn <b>Có</b>. Mỗi người chỉ được chọn <b>một</b> tài khoản để nhận an sinh. Sau khi được duyệt, mục <b>An sinh xã hội → Tài khoản hưởng ASXH</b> hiện <b>“Đang hoạt động”</b>.",
    goi: ["Đang hoạt động chưa?", "Đổi tài khoản"], link: "#/tich-hop" },

  { id: "thue_bao", tu: ["thue bao", "so dien thoai", "sim", "chua xac nhan", "so cu", "khong con dung"],
    dap: "<b>Số thuê bao di động</b>: vào <b>Truy cập chức năng → Số điện thoại</b>, ở số <b>Chưa xác nhận sử dụng</b> bấm <b>Chi tiết</b>. Chọn <b>Đang sử dụng</b> nếu còn dùng, hoặc <b>Không sử dụng</b> nếu không còn, rồi bấm <b>Xác nhận</b>.",
    goi: ["Mất số điện thoại"] },

  { id: "bhyt", tu: ["bhyt", "bao hiem y te", "the bao hiem", "so the", "the cu", "the moi", "ky tu", "vssid", "so suc khoe"],
    dap: "<b>Thẻ BHYT</b>: chọn <b>Đơn vị cấp thẻ</b>, nhập <b>số thẻ đủ ký tự</b> như mẫu. Thẻ <b>cũ có 15 ký tự</b>, thẻ <b>mới có 10 ký tự</b>. Nếu chưa cài được VNeID, bạn vẫn dùng được thẻ BHYT giấy còn hạn để khám chữa bệnh.",
    goi: ["Không có VNeID"] },

  { id: "dang_ky_xe", tu: ["dang ky xe", "xe may", "o to", "mo to", "bien so", "so khung", "giay dang ky xe", "xe"],
    dap: "<b>Đăng ký xe</b>: chọn <b>mô tô, xe gắn máy</b> hoặc <b>ô tô</b>, nhập <b>số khung</b> và <b>biển số</b> đúng như trên giấy đăng ký. Biển số <b>viết liền, không dấu gạch, không ký tự đặc biệt</b>. Dữ liệu đăng ký xe đã được đồng bộ trên VNeID từ 8/6/2026 theo nguồn đưa tin.",
    goi: ["Miễn lệ phí trước bạ"] },

  { id: "gplx", tu: ["giay phep lai xe", "gplx", "bang lai", "hang a1", "hang b", "hang lai", "bang lai xe"],
    dap: "<b>Giấy phép lái xe</b>: nhập <b>số GPLX</b> và chọn <b>hạng</b> (A1, A, B…) đúng như trên bằng. Thông tin được gửi tra cứu tại <b>Cục Cảnh sát giao thông</b>. Ứng dụng VNeTraffic cũng có thể cập nhật giấy tờ giao thông.",
    goi: [] },

  { id: "chu_ky", tu: ["chu ky so", "chung thu", "ky so", "goi cuoc", "mien phi", "face id", "smartca", "vnpt", "misa"],
    dap: "<b>Chữ ký số</b>: vào <b>Dịch vụ khác → Chứng thư chữ ký số → Đăng ký</b>, chọn nhà cung cấp và <b>gói cước</b> (có gói miễn phí khi đăng ký từ VNeID). Xác thực bằng <b>Face ID</b>, rồi bấm <b>Xác nhận kích hoạt ngay</b>. Điện thoại cần hỗ trợ Face ID.",
    goi: ["Gọi cán bộ"] },

  { id: "tai_anh", tu: ["tai anh", "dung luong", "3,5", "3.5", "pdf", "chup anh", "khong tai duoc", "file", "anh qua"],
    dap: "File phải là <b>PDF, PNG hoặc JPG</b>, tổng dung lượng tối đa <b>3,5MB</b>. Nếu quá lớn, hãy chụp lại rõ nét hoặc giảm kích thước. Ảnh phải đọc được rõ chữ và số.",
    goi: [] },

  { id: "mien_phi", tu: ["mien phi", "giam phi", "le phi", "truoc ba", "tien phi", "giam le phi", "mien le phi"],
    dap: "Người đã tích hợp đầy đủ giấy tờ được <b>miễn, giảm lệ phí</b> cho một số thủ tục hành chính (theo Nghị quyết 66.22/2026/NQ-CP). Ví dụ giảm lệ phí trước bạ khi đăng ký xe. Ưu đãi chỉ áp dụng <b>một lần mỗi năm</b>. Thời điểm có hiệu lực các nguồn đưa tin chưa thống nhất, bạn nên hỏi Công an xã để chắc chắn.",
    goi: ["Đăng ký xe", "Giấy khai sinh"] },

  { id: "khong_thay", tu: ["khong thay", "khong tim thay", "khong co muc", "chua co", "bi thieu", "khong hien"],
    dap: "Mục có thể nằm khác nhau tùy phiên bản. Hãy <b>cập nhật VNeID</b> lên bản mới nhất. Nếu vẫn không thấy, loại giấy tờ đó có thể chưa được hỗ trợ tích hợp. Bạn liên hệ <b>Công an xã</b> để được hướng dẫn.",
    goi: ["Gọi cán bộ"] },

  { id: "sai_tt", tu: ["sai thong tin", "khong khop", "bao sai", "khong dung", "bao loi", "bi loi", "loi", "noi cap"],
    dap: "Nếu hệ thống báo sai hoặc không khớp, bạn <b>đối chiếu lại với giấy tờ bản gốc</b> (số, ngày cấp, nơi cấp, biển số). Với giấy khai sinh, lỗi thường do chọn sai <b>nơi cấp</b> theo địa chính cũ hoặc mới. Nếu đúng mà vẫn lỗi, hãy đến <b>Công an xã</b> để được kiểm tra.",
    goi: ["Gọi cán bộ"] },

  { id: "cho_duyet", tu: ["gui roi", "da gui", "cho duyet", "phe duyet", "bao lau", "khi nao", "chua thay", "chua hien", "dang cho"],
    dap: "Sau khi gửi, hệ thống <b>tra cứu và phê duyệt</b> rồi mới hiện trên ứng dụng. Thời gian có thể khác nhau tùy loại giấy tờ. Bạn chờ thêm và kiểm tra lại trong <b>Ví giấy tờ</b>. Nếu lâu chưa cập nhật, hãy gọi cán bộ.",
    goi: ["Gọi cán bộ"] },

  { id: "gui_nham", tu: ["gui nham", "nhap nham", "sua lai", "huy yeu cau", "gui lai", "sua thong tin"],
    dap: "Nếu đã gửi nhầm, bạn <b>đừng gửi lại ngay</b>. Hãy liên hệ <b>Công an xã</b> để được hướng dẫn cách xử lý đúng.",
    goi: ["Gọi cán bộ"] },

  { id: "passcode", tu: ["passcode", "mat khau vneid", "quen mat khau", "quen passcode", "lay lai mat khau", "mat khau"],
    dap: "Quên passcode: ở màn hình đăng nhập bấm <b>Quên mật khẩu</b>, nhập số định danh và số điện thoại, chọn <b>xác thực NFC bằng thẻ Căn cước</b>, rồi áp thẻ vào điện thoại. Cần <b>thẻ gắn chip</b> và <b>điện thoại có NFC</b>.",
    goi: ["Điện thoại không có NFC"], link: "#/mat-khau" },

  { id: "khong_cccd", tu: ["khong co cccd", "chua co cccd", "khong co can cuoc", "chua co can cuoc", "khong co the can cuoc", "chua co the can cuoc", "cccd cu", "cccd khong chip", "khong gan chip", "chua gan chip", "khong co chip", "the can cuoc cu", "khong co giay to"],
    dap: "Nếu bạn <b>chưa có thẻ Căn cước gắn chip</b>, bạn chưa làm được các bước xác thực bằng NFC, như lấy lại mật khẩu VNeID hay quét chip khi mở tài khoản. Hãy đến <b>Công an xã Bờ Ngoong</b> để được hướng dẫn làm thẻ mới. Trong lúc chờ, thẻ BHYT giấy còn hạn vẫn dùng để khám chữa bệnh.",
    goi: ["Gọi cán bộ", "Điện thoại không có NFC"], link: "#/ho-tro" },
  { id: "chua_vneid", tu: ["chua co vneid", "chua cai vneid", "khong co vneid", "chua co tai khoan vneid", "chua dinh danh", "chua co tai khoan dinh danh", "chua dinh danh muc 2", "khong dinh danh"],
    dap: "Bạn cần có <b>tài khoản VNeID định danh mức 2</b> trước khi tích hợp. Bạn tải VNeID từ CH Play hoặc App Store, rồi kích hoạt định danh. Nếu không tự làm được, hãy đến <b>Công an xã Bờ Ngoong</b> để được hỗ trợ.",
    goi: ["Gọi cán bộ", "Tải ứng dụng VNeID"], link: "#/tai-app" },
  { id: "nfc", tu: ["nfc", "khong co nfc", "may cu", "dien thoai cu", "may khong co nfc"],
    dap: "Các bước xác thực cần <b>điện thoại có NFC</b>. Nếu máy không có NFC, hãy đến <b>Công an xã Bờ Ngoong</b> để được hỗ trợ trực tiếp.",
    goi: ["Gọi cán bộ"] },

  { id: "mat_so", tu: ["mat so", "mat sim", "mat dien thoai", "doi so", "so dien thoai dang ky", "mat so dien thoai"],
    dap: "Nếu số điện thoại đăng ký VNeID không còn dùng hoặc bị mất, bạn <b>không tự đổi được trên điện thoại</b>. Hãy đến <b>Công an xã Bờ Ngoong</b>, mang <b>thẻ Căn cước (bản gốc)</b>, điện thoại và SIM số mới.",
    goi: ["Gọi cán bộ"], link: "#/lien-he" },

  { id: "luong_huu", tu: ["luong huu", "tro cap", "bhxh", "bao hiem xa hoi", "chi tra", "nguoi huong"],
    dap: "Người hưởng lương hưu, trợ cấp có thể tạo <b>Tài khoản hưởng an sinh xã hội</b> trên VNeID <b>từ 28/9/2026</b>. Theo lộ trình đã đưa tin, BHXH sẽ chi trả qua tài khoản này từ <b>năm 2027</b>.",
    goi: ["Tài khoản an sinh"] },

  { id: "nd320", tu: ["28/9", "28 9", "nghi dinh 320", "nd 320", "hieu luc"],
    dap: "Nghị định <b>320/2026/NĐ-CP</b> có hiệu lực từ <b>28/9/2026</b> theo các nguồn đưa tin. Từ ngày này, người hưởng an sinh có thể tạo tài khoản hưởng an sinh trên VNeID. Mỗi người chỉ tích hợp <b>một</b> trong ba loại tài khoản (thanh toán, ví điện tử hoặc tài khoản tiền di động).",
    goi: ["Tài khoản an sinh"] },

  { id: "an_toan", tu: ["otp", "cau hoi cua can bo", "can bo hoi", "lua dao", "gia mao", "passcode cua toi", "bi lua", "mat khau cua toi"],
    dap: "<b>Cán bộ không bao giờ hỏi mật khẩu, mã OTP hay passcode</b> của bạn. Nếu có người gọi hoặc nhắn xin các thông tin này, đừng đưa và báo ngay cho Công an xã <b>0269 350 2339</b>.",
    goi: [] },

  { id: "gap_can_bo", tu: ["gap nguoi", "goi can bo", "can bo", "hotline", "truc ban", "gap can bo", "so dien thoai cong an", "dia chi"],
    dap: "Bạn gọi trực ban Công an xã Bờ Ngoong: <b>0269 350 2339</b>. Hoặc bấm <b>Để lại thông tin</b> trên trang để cán bộ gọi lại.",
    goi: [], link: "#/ho-tro" },

  { id: "cam_on", tu: ["cam on", "thanks", "ok", "da hieu", "duoc roi", "tot roi"],
    dap: "Không có gì! Nếu cần thêm, bạn cứ hỏi tiếp.", goi: [] },
];

// Chuẩn hóa: thường hóa, bỏ dấu, bỏ ký tự lạ
function chuanHoa(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9/,. ]/g, " ").replace(/\s+/g, " ").trim();
}

// Chấm điểm: cụm dài khớp được điểm cao hơn
function chamDiem(cau, kt) {
  let d = 0;
  kt.tu.forEach(k => {
    const kk = chuanHoa(k);
    if (!kk) return;
    if ((" " + cau + " ").includes(" " + kk + " ")) d += 2 + kk.split(" ").length;
    else if (cau.includes(kk)) d += 1 + kk.split(" ").length;
  });
  return d;
}

// Câu nối tiếp: "còn ô tô thì sao", "thế còn ngân hàng"
const NOI_TIEP = /^(con |the con |the |vay |con neu |neu )/;

let chuDe = null;

function timTraLoi(cauGoc) {
  const cau = chuanHoa(cauGoc);
  // Chặn thông tin nhạy cảm trước hết
  if (/(mat khau|otp|passcode|so cccd|can cuoc so|so dinh danh|so tai khoan|the atm)/.test(cau) &&
      /(gui|dua|cho|nhap|la|bao|cung cap)/.test(cau)) {
    return { dap: "Vui lòng <b>không gửi mật khẩu, mã OTP, passcode, số CCCD hay số tài khoản</b> vào khung này. Bạn chỉ cần làm theo hướng dẫn trên trang.", goi: ["Gọi cán bộ"] };
  }
  let tot = null, best = 0;
  KIEN_THUC.forEach(kt => {
    const d = chamDiem(cau, kt);
    if (d > best) { best = d; tot = kt; }
  });
  // Câu nối tiếp không có chủ đề mới: dùng chủ đề vừa nói
  if ((!tot || best < 2) && chuDe && NOI_TIEP.test(cau)) {
    const kt = KIEN_THUC.find(k => k.id === chuDe);
    if (kt) return Object.assign({}, kt, { dap: "Về chủ đề này: " + kt.dap });
  }
  if (tot && best >= 2) { chuDe = tot.id; return tot; }
  return {
    dap: "Tôi chưa hiểu rõ câu hỏi này. Bạn thử hỏi theo cách khác, ví dụ: <b>“tích hợp giấy khai sinh thế nào”</b>, <b>“thẻ BHYT cũ bao nhiêu ký tự”</b>, hoặc <b>gọi cán bộ Công an xã</b> để được trả lời trực tiếp.",
    goi: ["Giấy khai sinh", "Tài khoản ngân hàng", "Đăng ký xe", "Thẻ BHYT", "Gọi cán bộ"]
  };
}

const noi = document.getElementById("noi");
let dangGo = null;

function them(loai, html, goi, link) {
  const d = document.createElement("div");
  d.className = "bong " + loai;
  d.innerHTML = html;
  if (link) {
    const a = document.createElement("a");
    a.href = link; a.textContent = " → Mở trang hướng dẫn";
    a.style.display = "block"; a.style.marginTop = "6px";
    d.appendChild(a);
  }
  noi.appendChild(d);
  if (goi && goi.length) {
    const n = document.createElement("div");
    n.className = "nhanh";
    goi.forEach(g => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = g;
      b.onclick = () => hoi(g);
      n.appendChild(b);
    });
    noi.appendChild(n);
  }
  noi.scrollTop = noi.scrollHeight;
}

// Địa chỉ ứng dụng web Apps Script (xem tro-ly-gemini.gs). Để trống = chỉ dùng kịch bản từ khóa.
const TRO_LY_URL = "https://script.google.com/macros/s/AKfycbyy1LBToGME_3bDWHJtqQUrjwlPGw4IZIOVd9C0XwXi2I3wJPYmgVVUNLtPkyWqiM8JGw/exec";
let lichSu = [];

async function hoiAI(cau) {
  const phanHoi = await fetch(TRO_LY_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ cau: cau, lich: lichSu })
  });
  const du = await phanHoi.json();
  if (du.tra_loi) return du.tra_loi;
  throw new Error(du.loi || "không có trả lời");
}

function hoi(cau) {
  if (!cau || !cau.trim()) return;
  them("nguoi", cau.replace(/</g, "&lt;"));
  clearTimeout(dangGo);
  document.getElementById("dang-go").textContent = "Trợ lý đang trả lời…";
  const hienTra = (noi, goi, link) => {
    document.getElementById("dang-go").textContent = "";
    them("bot", noi, goi, link);
    lichSu.push({ vai: "bot", noi: noi.replace(/<[^>]+>/g, "") });
  };
  lichSu.push({ vai: "nguoi", noi: cau });
  if (TRO_LY_URL) {
    hoiAI(cau).then(noi => hienTra(noi.split(String.fromCharCode(10)).join("<br>")))
      .catch(() => { const tl = timTraLoi(cau); hienTra(tl.dap, tl.goi, tl.link); });
    return;
  }
  const tl = timTraLoi(cau);
  dangGo = setTimeout(() => hienTra(tl.dap, tl.goi, tl.link), 600);
}

document.getElementById("gui").onclick = () => {
  const v = document.getElementById("o").value;
  document.getElementById("o").value = "";
  hoi(v);
};
document.getElementById("o").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("gui").click(); });
document.getElementById("nut-mo").onclick = () => {
  document.getElementById("khung").classList.add("mo-khung");
  parent.postMessage({ chat: "mo" }, "*");
  if (!noi.childElementCount) {
    them("bot", "Chào bạn! Tôi là trợ lý tự động của <b>Công an xã Bờ Ngoong</b>. Tôi hướng dẫn bạn <b>tích hợp các loại giấy tờ lên VNeID</b>. Bạn muốn làm loại nào?",
      ["Giấy khai sinh", "Tài khoản ngân hàng", "Tài khoản an sinh", "Đăng ký xe", "Giấy phép lái xe", "Thẻ BHYT", "Số thuê bao", "Chữ ký số"]);
    them("bot", "<span style='font-size:13px'>⚠️ Không gửi mật khẩu, mã OTP hay số CCCD vào đây.</span>");
  }
};
document.getElementById("nut-dong").onclick = () => {
  document.getElementById("khung").classList.remove("mo-khung");
  parent.postMessage({ chat: "dong" }, "*");
};
