const cron = require("node-cron");
const prisma = require("../app/models/db.js");
const emailService = require("../services/EmailService.js");

/**
 * Job 1: Gửi email nhắc trả sách sắp đến hạn
 * Chạy mỗi ngày lúc 8:00 AM
 */
const sendDueSoonReminders = cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("📧 [CRON] Bắt đầu gửi email nhắc trả sách sắp đến hạn...");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Tính ngày 3 ngày sau
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      threeDaysLater.setHours(23, 59, 59, 999);

      // Tìm tất cả sách sắp đến hạn (còn 1-3 ngày)
      const dueSoonBooks = await prisma.chiTietMuon.findMany({
        where: {
          TrangThai: "DangMuon",
          NgayHenTra: {
            gte: today,
            lte: threeDaysLater,
          },
        },
        include: {
          PhieuMuon: {
            include: {
              DocGia: {
                select: {
                  HoTen: true,
                  Email: true,
                  MaDG: true,
                },
              },
            },
          },
          CuonSach: {
            include: {
              Sach: {
                select: {
                  TieuDe: true,
                },
              },
            },
          },
        },
      });

      // Nhóm sách theo độc giả
      const booksByReader = {};

      for (const ct of dueSoonBooks) {
        const docGia = ct.PhieuMuon.DocGia;
        const email = docGia.Email;

        if (!email) continue; // Bỏ qua nếu không có email

        if (!booksByReader[email]) {
          booksByReader[email] = {
            docGia: {
              hoTen: docGia.HoTen,
              maDG: docGia.MaDG,
            },
            books: [],
          };
        }

        const dueDate = new Date(ct.NgayHenTra);
        dueDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        booksByReader[email].books.push({
          tieuDe: ct.CuonSach.Sach.TieuDe,
          maCuonSach: ct.MaCuonSach,
          ngayHenTra: ct.NgayHenTra,
          soNgayConLai: daysLeft,
        });
      }

      // Gửi email cho từng độc giả
      let successCount = 0;
      let failCount = 0;

      for (const [email, data] of Object.entries(booksByReader)) {
        try {
          const htmlContent = emailService.generateDueSoonEmail(
            data.docGia,
            data.books
          );

          const result = await emailService.sendEmail(
            email,
            "🕐 Nhắc nhở: Sách sắp đến hạn trả - Thư viện UTE",
            htmlContent
          );

          if (result.success) {
            successCount++;
            console.log(
              `  ✅ Đã gửi email cho ${data.docGia.hoTen} (${data.books.length} cuốn)`
            );
          } else {
            failCount++;
            console.log(
              `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}: ${result.error}`
            );
          }

          // Delay 1 giây giữa các email để tránh spam
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          failCount++;
          console.error(
            `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}:`,
            error.message
          );
        }
      }

      console.log(
        `📧 [CRON] Hoàn thành! Thành công: ${successCount}, Thất bại: ${failCount}`
      );
    } catch (error) {
      console.error("❌ [CRON] Lỗi trong job gửi email nhắc trả sách:", error);
    }
  },
  {
    scheduled: false, // Không tự động start
    timezone: "Asia/Ho_Chi_Minh",
  }
);

/**
 * Job 2: Gửi email cảnh báo sách quá hạn
 * Chạy mỗi ngày lúc 9:00 AM
 */
const sendOverdueAlerts = cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("⚠️  [CRON] Bắt đầu gửi email cảnh báo sách quá hạn...");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Tìm tất cả sách quá hạn
      const overdueBooks = await prisma.chiTietMuon.findMany({
        where: {
          TrangThai: "DangMuon",
          NgayHenTra: {
            lt: today,
          },
        },
        include: {
          PhieuMuon: {
            include: {
              DocGia: {
                select: {
                  HoTen: true,
                  Email: true,
                  MaDG: true,
                },
              },
            },
          },
          CuonSach: {
            include: {
              Sach: {
                select: {
                  TieuDe: true,
                  GiaSach: true,
                },
              },
            },
          },
        },
      });

      // Lấy cấu hình phí phạt
      const configPhat = await prisma.cauHinhHeThong.findFirst({
        where: {
          Nhom: "Phat",
          TenThamSo: "PhiTreHanMoiNgay",
        },
      });
      const phiTreHan = parseFloat(configPhat?.GiaTri || "5000");

      // Nhóm sách theo độc giả
      const booksByReader = {};

      for (const ct of overdueBooks) {
        const docGia = ct.PhieuMuon.DocGia;
        const email = docGia.Email;

        if (!email) continue;

        if (!booksByReader[email]) {
          booksByReader[email] = {
            docGia: {
              hoTen: docGia.HoTen,
              maDG: docGia.MaDG,
            },
            books: [],
          };
        }

        const dueDate = new Date(ct.NgayHenTra);
        dueDate.setHours(0, 0, 0, 0);
        const daysOverdue = Math.floor(
          (today - dueDate) / (1000 * 60 * 60 * 24)
        );
        const tienPhat = daysOverdue * phiTreHan;

        booksByReader[email].books.push({
          tieuDe: ct.CuonSach.Sach.TieuDe,
          maCuonSach: ct.MaCuonSach,
          ngayHenTra: ct.NgayHenTra,
          soNgayQuaHan: daysOverdue,
          tienPhat: tienPhat,
        });
      }

      // Gửi email cho từng độc giả
      let successCount = 0;
      let failCount = 0;

      for (const [email, data] of Object.entries(booksByReader)) {
        try {
          const htmlContent = emailService.generateOverdueEmail(
            data.docGia,
            data.books
          );

          const result = await emailService.sendEmail(
            email,
            "⚠️ CẢnh BÁO: Sách quá hạn - Vui lòng trả ngay!",
            htmlContent
          );

          if (result.success) {
            successCount++;
            console.log(
              `  ✅ Đã gửi email cho ${data.docGia.hoTen} (${data.books.length} cuốn quá hạn)`
            );
          } else {
            failCount++;
            console.log(
              `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}: ${result.error}`
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          failCount++;
          console.error(
            `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}:`,
            error.message
          );
        }
      }

      console.log(
        `⚠️  [CRON] Hoàn thành! Thành công: ${successCount}, Thất bại: ${failCount}`
      );
    } catch (error) {
      console.error("❌ [CRON] Lỗi trong job gửi email quá hạn:", error);
    }
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

/**
 * Job 3: Gửi email nhắc thanh toán phạt
 * Chạy mỗi ngày lúc 10:00 AM
 */
const sendUnpaidFineReminders = cron.schedule(
  "0 10 * * *",
  async () => {
    console.log("💰 [CRON] Bắt đầu gửi email nhắc thanh toán phạt...");

    try {
      // Tìm tất cả phạt chưa thanh toán
      const unpaidFines = await prisma.thePhat.findMany({
        where: {
          TrangThaiThanhToan: "ChuaThanhToan",
        },
        include: {
          TraSach: {
            include: {
              PhieuMuon: {
                include: {
                  DocGia: {
                    select: {
                      HoTen: true,
                      Email: true,
                      MaDG: true,
                    },
                  },
                },
              },
            },
          },
          CuonSach: {
            include: {
              Sach: {
                select: {
                  TieuDe: true,
                },
              },
            },
          },
        },
      });

      // Nhóm phạt theo độc giả
      const finesByReader = {};

      for (const fine of unpaidFines) {
        const docGia = fine.TraSach.PhieuMuon.DocGia;
        const email = docGia.Email;

        if (!email) continue;

        if (!finesByReader[email]) {
          finesByReader[email] = {
            docGia: {
              hoTen: docGia.HoTen,
              maDG: docGia.MaDG,
            },
            fines: [],
          };
        }

        // Tính số ngày nếu là phạt trễ hạn
        let soNgay = 0;
        if (fine.LyDoPhat === "TreHan") {
          const configPhat = await prisma.cauHinhHeThong.findFirst({
            where: { Nhom: "Phat", TenThamSo: "PhiTreHanMoiNgay" },
          });
          const phiTreHan = parseFloat(configPhat?.GiaTri || "5000");
          soNgay = Math.floor(parseFloat(fine.SoTienPhat) / phiTreHan);
        }

        finesByReader[email].fines.push({
          tieuDe: fine.CuonSach.Sach.TieuDe,
          lyDo: fine.LyDoPhat,
          soTien: parseFloat(fine.SoTienPhat),
          soNgay: soNgay,
        });
      }

      // Gửi email cho từng độc giả
      let successCount = 0;
      let failCount = 0;

      for (const [email, data] of Object.entries(finesByReader)) {
        try {
          // Gửi email cho khoản phạt đầu tiên (hoặc có thể tổng hợp tất cả)
          const firstFine = data.fines[0];

          const htmlContent = emailService.generateNewFineEmail(
            data.docGia,
            firstFine
          );

          const result = await emailService.sendEmail(
            email,
            "💰 Nhắc nhở: Bạn có khoản phạt chưa thanh toán - Thư viện UTE",
            htmlContent
          );

          if (result.success) {
            successCount++;
            console.log(
              `  ✅ Đã gửi email cho ${data.docGia.hoTen} (${data.fines.length} khoản phạt)`
            );
          } else {
            failCount++;
            console.log(
              `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}: ${result.error}`
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          failCount++;
          console.error(
            `  ❌ Lỗi gửi email cho ${data.docGia.hoTen}:`,
            error.message
          );
        }
      }

      console.log(
        `💰 [CRON] Hoàn thành! Thành công: ${successCount}, Thất bại: ${failCount}`
      );
    } catch (error) {
      console.error(
        "❌ [CRON] Lỗi trong job gửi email nhắc thanh toán phạt:",
        error
      );
    }
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

/**
 * Job 4: Cập nhật trạng thái sách quá hạn
 * Chạy mỗi ngày lúc 00:00
 */
const updateOverdueStatus = cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("🔄 [CRON] Bắt đầu cập nhật trạng thái sách quá hạn...");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Cập nhật trạng thái sang 'TreHan'
      const result = await prisma.chiTietMuon.updateMany({
        where: {
          TrangThai: "DangMuon",
          NgayHenTra: {
            lt: today,
          },
        },
        data: {
          TrangThai: "TreHan",
        },
      });

      console.log(
        `🔄 [CRON] Đã cập nhật ${result.count} sách sang trạng thái quá hạn`
      );
    } catch (error) {
      console.error("❌ [CRON] Lỗi cập nhật trạng thái quá hạn:", error);
    }
  },
  {
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

/**
 * Khởi động tất cả jobs
 */
function startAllJobs() {
  console.log("🚀 Bắt đầu tất cả scheduled jobs...");

  sendDueSoonReminders.start();
  console.log('  ✅ Job "Nhắc trả sách" đã được kích hoạt (8:00 AM hàng ngày)');

  sendOverdueAlerts.start();
  console.log(
    '  ✅ Job "Cảnh báo quá hạn" đã được kích hoạt (9:00 AM hàng ngày)'
  );

  sendUnpaidFineReminders.start();
  console.log(
    '  ✅ Job "Nhắc thanh toán phạt" đã được kích hoạt (10:00 AM hàng ngày)'
  );

  updateOverdueStatus.start();
  console.log(
    '  ✅ Job "Cập nhật trạng thái" đã được kích hoạt (00:00 hàng ngày)'
  );
}

/**
 * Dừng tất cả jobs
 */
function stopAllJobs() {
  console.log("🛑 Dừng tất cả scheduled jobs...");
  sendDueSoonReminders.stop();
  sendOverdueAlerts.stop();
  sendUnpaidFineReminders.stop();
  updateOverdueStatus.stop();
}

module.exports = {
  startAllJobs,
  stopAllJobs,
};
