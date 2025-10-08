/**
 * VietQR Utility
 * Tạo QR Code thanh toán theo chuẩn VietQR
 * API Document: https://www.vietqr.io/
 */

/**
 * Danh sách ngân hàng hỗ trợ VietQR
 */
export const BANK_LIST = {
  VCB: { name: "Vietcombank", bin: "970436" },
  TCB: { name: "Techcombank", bin: "970407" },
  MB: { name: "MBBank", bin: "970422" },
  VIB: { name: "VIB", bin: "970441" },
  ACB: { name: "ACB", bin: "970416" },
  TPB: { name: "TPBank", bin: "970423" },
  STB: { name: "Sacombank", bin: "970403" },
  VPB: { name: "VPBank", bin: "970432" },
  BIDV: { name: "BIDV", bin: "970418" },
  AGR: { name: "Agribank", bin: "970405" },
  SCB: { name: "SCB", bin: "970429" },
  OCB: { name: "OCB", bin: "970448" },
  MSB: { name: "MSB", bin: "970426" },
  SHB: { name: "SHB", bin: "970443" },
  HDBank: { name: "HDBank", bin: "970437" },
};

/**
 * Tạo URL VietQR
 * @param {Object} params - Thông số tạo QR
 * @param {string} params.bankBin - Mã BIN ngân hàng (6 số)
 * @param {string} params.accountNumber - Số tài khoản
 * @param {string} params.accountName - Tên chủ tài khoản
 * @param {number} params.amount - Số tiền (VNĐ)
 * @param {string} params.description - Nội dung chuyển khoản
 * @param {string} params.template - Template QR (compact/print/qr_only)
 * @returns {string} URL của QR code
 */
export const generateVietQRUrl = ({
  bankBin = "970436", // Mặc định Vietcombank
  accountNumber,
  accountName,
  amount,
  description,
  template = "compact",
}) => {
  // Validate
  if (!accountNumber) {
    throw new Error("Số tài khoản không được để trống");
  }
  if (!accountName) {
    throw new Error("Tên chủ tài khoản không được để trống");
  }
  if (!amount || amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0");
  }

  // Format account name (uppercase, no accents)
  const formattedAccountName =
    removeVietnameseAccents(accountName).toUpperCase();

  // Format description (remove special chars)
  const formattedDescription = description
    ? removeVietnameseAccents(description).replace(/[^a-zA-Z0-9\s]/g, "")
    : `THUVIEN ${Date.now()}`;

  // Build URL theo chuẩn VietQR API
  const baseUrl = "https://img.vietqr.io/image";
  const url = `${baseUrl}/${bankBin}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
    formattedDescription
  )}&accountName=${encodeURIComponent(formattedAccountName)}`;

  return url;
};

/**
 * Tạo QR cho thanh toán phạt thư viện
 * @param {Object} fine - Thông tin phạt
 * @param {Object} bankInfo - Thông tin ngân hàng thư viện
 * @returns {string} URL QR code
 */
export const generateFinePaymentQR = (fine, bankInfo = {}) => {
  const {
    bankBin = "970436", // Vietcombank mặc định
    accountNumber = "1040490270",
    accountName = "BUI THANH TAM",
  } = bankInfo;

  const description = `TT ${fine.MaPhat} DG ${
    fine.TraSach?.PhieuMuon?.DocGia?.MaDG || "UNKNOWN"
  }`;

  return generateVietQRUrl({
    bankBin,
    accountNumber,
    accountName,
    amount: parseFloat(fine.SoTienPhat),
    description,
    template: "compact",
  });
};

/**
 * Xóa dấu tiếng Việt
 */
function removeVietnameseAccents(str) {
  if (!str) return "";

  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");

  return str;
}

/**
 * Format số tiền VNĐ
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
