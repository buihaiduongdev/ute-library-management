const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class EmailService {
  constructor() {
    // Khởi tạo transporter với Gmail
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASSWORD, // App password của Gmail
      },
    });
  }

  /**
   * Gửi email với template HTML
   */
  async sendEmail(to, subject, htmlContent) {
    try {
      const mailOptions = {
        from: `"Thư viện UTE" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email đã gửi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Lỗi gửi email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Template email nhắc trả sách sắp đến hạn
   */
  generateDueSoonEmail(docGia, books) {
    const booksList = books
      .map(
        (book) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${book.tieuDe}</strong><br>
          <span style="color: #666; font-size: 14px;">Mã cuốn: ${
            book.maCuonSach
          }</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${new Date(book.ngayHenTra).toLocaleDateString("vi-VN")}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          <span style="color: ${
            book.soNgayConLai <= 1 ? "#fa5252" : "#fd7e14"
          }; font-weight: bold;">
            ${
              book.soNgayConLai === 0
                ? "Hôm nay"
                : book.soNgayConLai === 1
                ? "Ngày mai"
                : `${book.soNgayConLai} ngày nữa`
            }
          </span>
        </td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nhắc nhở trả sách</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🕐 Nhắc nhở trả sách</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong>${docGia.hoTen}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bạn có <strong style="color: #fd7e14;">${books.length} cuốn sách</strong> sắp đến hạn trả. 
                Vui lòng kiểm tra và trả sách đúng hạn để tránh bị phạt.
              </p>
              
              <!-- Books Table -->
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #eee;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Tên sách</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Hạn trả</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  ${booksList}
                </tbody>
              </table>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/reader/dashboard?tab=borrowed" 
                   style="background-color: #667eea; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Xem sách đang mượn
                </a>
              </div>
              
              <div style="background-color: #fff3bf; border-left: 4px solid #fd7e14; padding: 15px; margin-top: 20px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Lưu ý:</strong> Sách trả trễ sẽ bị phạt 5,000 VNĐ/ngày.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                Thư viện Đại học Sư phạm Kỹ thuật TP.HCM
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Đây là email tự động, vui lòng không trả lời email này.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Template email thông báo sách quá hạn
   */
  generateOverdueEmail(docGia, books) {
    const booksList = books
      .map(
        (book) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${book.tieuDe}</strong><br>
          <span style="color: #666; font-size: 14px;">Mã cuốn: ${
            book.maCuonSach
          }</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${new Date(book.ngayHenTra).toLocaleDateString("vi-VN")}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          <span style="color: #fa5252; font-weight: bold;">
            ${book.soNgayQuaHan} ngày
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          <span style="color: #fa5252; font-weight: bold;">
            ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(book.tienPhat)}
          </span>
        </td>
      </tr>
    `
      )
      .join("");

    const tongPhat = books.reduce((sum, book) => sum + book.tienPhat, 0);

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo quá hạn</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #fa5252 0%, #e03131 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⚠️ Sách quá hạn!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong>${docGia.hoTen}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bạn có <strong style="color: #fa5252;">${
                  books.length
                } cuốn sách</strong> đã quá hạn trả. 
                Vui lòng đến thư viện trả sách ngay để tránh phạt thêm.
              </p>
              
              <!-- Books Table -->
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #eee;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Tên sách</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Hạn trả</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Quá hạn</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Phạt</th>
                  </tr>
                </thead>
                <tbody>
                  ${booksList}
                </tbody>
                <tfoot>
                  <tr style="background-color: #fff5f5;">
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; color: #fa5252;">
                      TỔNG TIỀN PHẠT:
                    </td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; color: #fa5252; font-size: 18px;">
                      ${new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(tongPhat)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL
                }/reader/dashboard?tab=borrowed" 
                   style="background-color: #fa5252; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Trả sách ngay
                </a>
              </div>
              
              <div style="background-color: #ffe3e3; border-left: 4px solid #fa5252; padding: 15px; margin-top: 20px;">
                <p style="color: #c92a2a; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                  ⚠️ CẢNH BÁO QUAN TRỌNG
                </p>
                <p style="color: #c92a2a; margin: 0; font-size: 14px; line-height: 1.6;">
                  • Phí phạt: 5,000 VNĐ/ngày/cuốn<br>
                  • Nếu không trả trong 30 ngày, tài khoản sẽ bị khóa<br>
                  • Phạt tích lũy sẽ được cộng dồn vào lần trả sách
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                Thư viện Đại học Sư phạm Kỹ thuật TP.HCM
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Liên hệ: library@hcmute.edu.vn | Hotline: 1900-xxxx
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Template email thông báo yêu cầu được duyệt
   */
  generateRequestApprovedEmail(docGia, book) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yêu cầu được duyệt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Yêu cầu được duyệt!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong>${docGia.hoTen}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Yêu cầu mượn sách của bạn đã được phê duyệt! 🎉
              </p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2f9e44; margin: 0 0 15px 0;">📚 Thông tin sách</h3>
                <p style="margin: 8px 0; color: #333;">
                  <strong>Tên sách:</strong> ${book.tieuDe}
                </p>
                <p style="margin: 8px 0; color: #333;">
                  <strong>Mã cuốn:</strong> ${book.maCuonSach}
                </p>
                <p style="margin: 8px 0; color: #333;">
                  <strong>Ngày hẹn trả:</strong> ${new Date(
                    book.ngayHenTra
                  ).toLocaleDateString("vi-VN")}
                </p>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Vui lòng đến thư viện trong <strong>3 ngày</strong> để nhận sách. 
                Sau thời gian này, yêu cầu sẽ tự động hủy.
              </p>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL
                }/reader/dashboard?tab=requests" 
                   style="background-color: #51cf66; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Xem chi tiết
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                Thư viện Đại học Sư phạm Kỹ thuật TP.HCM
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Giờ làm việc: 7:30 - 17:00 (Thứ 2 - Thứ 6)
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Template email thông báo có phạt mới
   */
  generateNewFineEmail(docGia, fine) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Thông báo phạt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">💰 Thông báo phạt</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong>${docGia.hoTen}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bạn có khoản phạt mới từ việc trả sách.
              </p>
              
              <div style="background-color: #fff4e6; padding: 20px; border-radius: 8px; border-left: 4px solid #fd7e14; margin: 20px 0;">
                <h3 style="color: #e8590c; margin: 0 0 15px 0;">Chi tiết phạt</h3>
                <p style="margin: 8px 0; color: #333;">
                  <strong>Sách:</strong> ${fine.tieuDe}
                </p>
                <p style="margin: 8px 0; color: #333;">
                  <strong>Lý do:</strong> ${
                    fine.lyDo === "TreHan"
                      ? `Trễ hạn ${fine.soNgay} ngày`
                      : fine.lyDo === "HuHong"
                      ? "Sách hư hỏng"
                      : "Sách mất"
                  }
                </p>
                <p style="margin: 8px 0; color: #e8590c; font-size: 20px;">
                  <strong>Số tiền phạt:</strong> ${new Intl.NumberFormat(
                    "vi-VN",
                    {
                      style: "currency",
                      currency: "VND",
                    }
                  ).format(fine.soTien)}
                </p>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Vui lòng thanh toán phạt tại thư viện hoặc quét mã QR để thanh toán online.
              </p>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL
                }/reader/dashboard?tab=fines" 
                   style="background-color: #fd7e14; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Thanh toán ngay
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                Thư viện Đại học Sư phạm Kỹ thuật TP.HCM
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hotline: 1900-xxxx | Email: library@hcmute.edu.vn
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

module.exports = new EmailService();
