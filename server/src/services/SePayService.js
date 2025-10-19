const axios = require("axios");

class SePayService {
  constructor() {
    this.apiKey =
      process.env.SEPAY_API_KEY ||
      "0UKHLV7CD1XWKKME3PQTYQ1BZZLKFBFW4VB8YJGSV84SCV6OQGANFAZXHYNAQGNW";
    this.accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || "6460603752";
    this.bankCode = "BIDV";
    this.baseURL = "https://my.sepay.vn/userapi";
  }

  /**  Tạo nội dung chuyển khoản */
  generateTransferContent(transactionCode) {
    return `UTE ${transactionCode}`;
  }

  /**  Tạo mã QR thanh toán */
  async generateQRCode(transactionCode, amount, description = "") {
    try {
      const content = this.generateTransferContent(transactionCode);
      const qrUrl = `https://img.vietqr.io/image/970418-${
        this.accountNumber
      }-compact.png?amount=${amount}&addInfo=${encodeURIComponent(
        content
      )}&accountName=${encodeURIComponent("UTE LIBRARY")}`;

      return {
        success: true,
        qrCodeUrl: qrUrl,
        accountNumber: this.accountNumber,
        accountName: "UTE LIBRARY",
        bankCode: this.bankCode,
        amount,
        content,
        transactionCode,
      };
    } catch (error) {
      console.error("Generate QR Code Error:", error.message);
      throw new Error("Không thể tạo mã QR thanh toán");
    }
  }

  /**  Kiểm tra giao dịch theo mã */
  async checkTransaction(transactionCode, amount) {
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 7);

      const formatDate = (date) =>
        `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;

      const response = await axios.get(`${this.baseURL}/transactions/list`, {
        params: {
          account_number: this.accountNumber,
          limit: 100,
          date_from: formatDate(dateFrom),
          date_to: formatDate(dateTo),
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status !== 200)
        return { success: false, paid: false, message: "API SePay lỗi" };

      const content = this.generateTransferContent(transactionCode);
      const transactions = response.data.transactions || [];

      const matched = transactions.find((t) => {
        const text = (t.transaction_content || "").toUpperCase();
        const code = transactionCode.toUpperCase();
        const amountMatch = Math.abs(t.amount_in - amount) < 1;
        const contentMatch =
          text.includes(content.toUpperCase()) ||
          (text.includes("UTE") && text.includes(code));
        return amountMatch && contentMatch;
      });

      if (matched) {
        return {
          success: true,
          paid: true,
          transaction: {
            id: matched.id,
            amount: matched.amount_in,
            content: matched.transaction_content,
            date: matched.transaction_date,
            bank: matched.bank_brand_name,
          },
        };
      }

      return {
        success: true,
        paid: false,
        message:
          "Chưa tìm thấy giao dịch phù hợp. Vui lòng kiểm tra nội dung và số tiền.",
      };
    } catch (error) {
      return {
        success: false,
        paid: false,
        message:
          "Lỗi kết nối với SePay. Vui lòng kiểm tra API key hoặc thử lại sau.",
      };
    }
  }

  /**  Lấy lịch sử giao dịch */
  async getTransactionHistory(limit = 20) {
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const formatDate = (d) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()}`;

      const res = await axios.get(`${this.baseURL}/transactions/list`, {
        params: {
          account_number: this.accountNumber,
          limit,
          date_from: formatDate(dateFrom),
          date_to: formatDate(dateTo),
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return res.data?.status === 200
        ? { success: true, transactions: res.data.transactions || [] }
        : { success: false, transactions: [] };
    } catch {
      throw new Error("Không thể lấy lịch sử giao dịch");
    }
  }

  /**  Sinh mã giao dịch duy nhất */
  generateTransactionCode(maPhat) {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `PHAT${maPhat}${timestamp}`;
  }
}

module.exports = new SePayService();
