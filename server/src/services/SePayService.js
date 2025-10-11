const axios = require('axios');

class SePayService {
    constructor() {
        this.apiKey = process.env.SEPAY_API_KEY || '0UKHLV7CD1XWKKME3PQTYQ1BZZLKFBFW4VB8YJGSV84SCV6OQGANFAZXHYNAQGNW';
        this.accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || '6460603752';
        this.bankCode = 'BIDV'; // Ngân hàng BIDV
        this.baseURL = 'https://my.sepay.vn/userapi';
    }

    /**
     * Tạo nội dung chuyển khoản với mã giao dịch
     * @param {string} transactionCode - Mã giao dịch unique
     * @param {number} amount - Số tiền
     * @returns {string} - Nội dung chuyển khoản
     */
    generateTransferContent(transactionCode, amount) {
        return `UTE ${transactionCode}`;
    }

    /**
     * Tạo QR code thanh toán
     * @param {string} transactionCode - Mã giao dịch
     * @param {number} amount - Số tiền thanh toán
     * @param {string} description - Mô tả giao dịch
     * @returns {Object} - URL QR code và thông tin thanh toán
     */
    async generateQRCode(transactionCode, amount, description = '') {
        try {
            const content = this.generateTransferContent(transactionCode, amount);
            
            // Sử dụng VietQR API để tạo QR code
            // Format: https://api.vietqr.io/v2/generate
            const qrData = {
                accountNo: this.accountNumber,
                accountName: 'UTE LIBRARY',
                acqId: '970418', // BIDV bank code
                amount: amount,
                addInfo: content,
                format: 'text',
                template: 'compact'
            };

            const vietQRUrl = `https://img.vietqr.io/image/${qrData.acqId}-${qrData.accountNo}-${qrData.template}.png?amount=${qrData.amount}&addInfo=${encodeURIComponent(qrData.addInfo)}&accountName=${encodeURIComponent(qrData.accountName)}`;

            return {
                success: true,
                qrCodeUrl: vietQRUrl,
                accountNumber: this.accountNumber,
                accountName: 'UTE LIBRARY',
                bankCode: this.bankCode,
                amount: amount,
                content: content,
                transactionCode: transactionCode
            };
        } catch (error) {
            console.error('Generate QR Code Error:', error);
            throw new Error('Không thể tạo mã QR thanh toán');
        }
    }

    /**
     * Kiểm tra giao dịch đã thanh toán chưa
     * @param {string} transactionCode - Mã giao dịch cần kiểm tra
     * @param {number} amount - Số tiền cần thanh toán
     * @returns {Object} - Thông tin giao dịch
     */
    async checkTransaction(transactionCode, amount) {
        try {
            // Tính ngày từ 7 ngày trước đến hiện tại
            const dateTo = new Date();
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - 7);

            // Format: DD/MM/YYYY
            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            console.log('🔍 Checking transaction with SePay...');
            console.log('   Transaction Code:', transactionCode);
            console.log('   Amount:', amount);
            console.log('   Account Number:', this.accountNumber);

            const response = await axios.get(`${this.baseURL}/transactions/list`, {
                params: {
                    account_number: this.accountNumber,
                    limit: 100, // Lấy 100 giao dịch gần nhất
                    date_from: formatDate(dateFrom),
                    date_to: formatDate(dateTo)
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 SePay Response:', {
                status: response.data?.status,
                message: response.data?.messages,
                transactionCount: response.data?.transactions?.length || 0
            });

            if (response.data && response.data.status === 200) {
                const transactions = response.data.transactions || [];
                const content = this.generateTransferContent(transactionCode, amount);
                
                console.log('🔍 Searching for transaction with content:', content);
                console.log('📝 Recent transactions:');
                transactions.slice(0, 5).forEach(trans => {
                    console.log(`   - ${trans.transaction_content} | Amount: ${trans.amount_in} | Date: ${trans.transaction_date}`);
                });

                // Tìm giao dịch khớp với mã và số tiền
                const matchedTransaction = transactions.find(trans => {
                    const transContent = (trans.transaction_content || '').toUpperCase().trim();
                    const searchContent = content.toUpperCase().trim(); // "UTE PHAT1ABC123"
                    const searchCode = transactionCode.toUpperCase().trim(); // "PHAT1ABC123"
                    
                    // Kiểm tra số tiền khớp (chấp nhận sai số 1 đồng)
                    const amountMatch = Math.abs(parseFloat(trans.amount_in) - amount) < 1;
                    
                    // Kiểm tra nội dung chuyển khoản - linh hoạt hơn
                    // Option 1: Khớp chính xác "UTE PHAT1ABC123"
                    // Option 2: Chứa "PHAT1ABC123" và có "UTE" ở đâu đó
                    // Option 3: Chứa "UTE" và "PHAT1ABC123" (không cần liền kề)
                    const exactMatch = transContent.includes(searchContent);
                    const flexibleMatch = transContent.includes(searchCode) && transContent.includes('UTE');
                    const contentMatch = exactMatch || flexibleMatch;
                    
                    // Debug logging cho mỗi giao dịch được kiểm tra
                    if (amountMatch) {
                        console.log(`   🔍 Checking: "${trans.transaction_content}"`);
                        console.log(`      Amount match: ✅ (${trans.amount_in} ≈ ${amount})`);
                        console.log(`      Exact match: ${exactMatch ? '✅' : '❌'} (looking for "${searchContent}")`);
                        console.log(`      Flexible match: ${flexibleMatch ? '✅' : '❌'} (has "UTE" + "${searchCode}")`);
                        console.log(`      Final: ${contentMatch ? '✅ MATCHED' : '❌ Not matched'}`);
                    }
                    
                    if (contentMatch && amountMatch) {
                        console.log('✅✅✅ Found matching transaction:', trans.transaction_content);
                    }
                    
                    return amountMatch && contentMatch;
                });

                if (matchedTransaction) {
                    console.log('✅ Payment confirmed!');
                    return {
                        success: true,
                        paid: true,
                        transaction: {
                            id: matchedTransaction.id,
                            amount: matchedTransaction.amount_in,
                            content: matchedTransaction.transaction_content,
                            date: matchedTransaction.transaction_date,
                            bankAccount: matchedTransaction.bank_brand_name
                        }
                    };
                }

                console.log('❌ No matching transaction found');
                return {
                    success: true,
                    paid: false,
                    message: 'Chưa tìm thấy giao dịch thanh toán. Vui lòng đảm bảo bạn đã chuyển đúng nội dung và số tiền.'
                };
            }

            console.log('❌ Invalid response from SePay:', response.data);
            return {
                success: false,
                paid: false,
                message: response.data?.messages || 'Không thể kiểm tra giao dịch'
            };

        } catch (error) {
            console.error('❌ Check Transaction Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Nếu lỗi API key hoặc connection, vẫn trả về response để không break flow
            return {
                success: false,
                paid: false,
                message: 'Lỗi kết nối với hệ thống thanh toán. Vui lòng kiểm tra API key hoặc thử lại sau.',
                error: error.response?.data?.messages || error.message
            };
        }
    }

    /**
     * Lấy lịch sử giao dịch
     * @param {number} limit - Số lượng giao dịch cần lấy
     * @returns {Array} - Danh sách giao dịch
     */
    async getTransactionHistory(limit = 20) {
        try {
            // Lấy giao dịch trong 30 ngày gần nhất
            const dateTo = new Date();
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - 30);

            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const response = await axios.get(`${this.baseURL}/transactions/list`, {
                params: {
                    account_number: this.accountNumber,
                    limit: limit,
                    date_from: formatDate(dateFrom),
                    date_to: formatDate(dateTo)
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.status === 200) {
                return {
                    success: true,
                    transactions: response.data.transactions || []
                };
            }

            return {
                success: false,
                transactions: [],
                message: response.data?.messages || 'Không thể lấy lịch sử giao dịch'
            };

        } catch (error) {
            console.error('Get Transaction History Error:', error.response?.data || error.message);
            throw new Error('Không thể lấy lịch sử giao dịch');
        }
    }

    /**
     * Tạo mã giao dịch unique
     * @param {number} maPhat - Mã phạt
     * @returns {string} - Mã giao dịch
     */
    generateTransactionCode(maPhat) {
        const timestamp = Date.now().toString(36).toUpperCase();
        return `PHAT${maPhat}${timestamp}`;
    }
}

module.exports = new SePayService();
