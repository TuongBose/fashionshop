import crypto from "crypto";
import moment from 'moment';
import querystring from 'qs';
import axios from 'axios';
import { getLocalIp, sortObject } from "../middlewares/utilsMiddleware";
  
export async function createPaymentUrl(req, res) {   
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    const vnpUrl = process.env.vnp_Url;

    const serverIp = getLocalIp();
    const port = process.env.PORT || 3000;
    const returnUrl = `http://${serverIp}:${port}/api/payments/vnpay_return`;
    
    let orderId = moment(date).format('DDHHmmss'); 
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let locale = req.body.language || 'vn'; 
    let currCode = 'VND'; 
    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': locale,
        'vnp_CurrCode': currCode,
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': 'Thanh toan cho ma GD:' + orderId,
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate,
    };

    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

    return res.status(200).json({
                message: "Tạo payment url thành công",
                data: { 
                    payment_url: paymentUrl 
                },
            });   
    } 

export async function queryTransaction(req, res) {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();

    const vnp_TmnCode = process.env.vnp_TmnCode; 
    const secretKey = process.env.vnp_HashSecret; 
    const vnp_Api = process.env.vnp_Api; 

    const vnp_TxnRef = req.body.orderId; 
    const vnp_TransactionDate = req.body.transDate; 

    const vnp_RequestId = moment(date).format("HHmmss"); 
    const vnp_Version = "2.1.0";
    const vnp_Command = "querydr"; 
    const vnp_OrderInfo = `Truy vấn giao dịch mã: ${vnp_TxnRef}`; 

    const vnp_IpAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress;

    const vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss"); 

    const data = [
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TxnRef,
        vnp_TransactionDate,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_OrderInfo,
    ].join("|");

    const hmac = crypto.createHmac("sha512", secretKey);
    const vnp_SecureHash = hmac.update(Buffer.from(data, "utf-8")).digest("hex");

    const dataObj = {
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TxnRef,
        vnp_OrderInfo,
        vnp_TransactionDate,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_SecureHash,
    };

    try {
        const response = await axios.post(vnp_Api, dataObj);

        if (response.data?.RspCode === "00") {
            return res.status(200).json({
                message: "Truy vấn giao dịch thành công",
                data: response.data,
            });
        } else {
            return res.status(400).json({
                message: `Truy vấn thất bại: ${response.data?.Message || "Không xác định"}`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi khi truy vấn giao dịch",
            error: error.message,
        });
    }
}

export async function refundTransaction(req, res) {
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();

    const vnp_TmnCode = process.env.vnp_TmnCode; 
    const secretKey = process.env.vnp_HashSecret; 
    const vnp_Api = process.env.vnp_Api; 

    const vnp_TxnRef = req.body.orderId; 
    const vnp_TransactionDate = req.body.transDate; 
    const vnp_Amount = req.body.amount * 100;
    const vnp_TransactionType = req.body.transType; 
    const vnp_CreateBy = req.body.user;

    const vnp_RequestId = moment(date).format("HHmmss"); 
    const vnp_Version = "2.1.0"; 
    const vnp_Command = "refund"; 
    const vnp_OrderInfo = `Hoàn tiền GD mã: ${vnp_TxnRef}`; 
    const vnp_IpAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress;
    const vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss"); 
    const vnp_TransactionNo = "0"; 

    const data = [
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TransactionType,
        vnp_TxnRef,
        vnp_Amount,
        vnp_TransactionNo,
        vnp_TransactionDate,
        vnp_CreateBy,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_OrderInfo,
    ].join("|");

    const hmac = crypto.createHmac("sha512", secretKey);
    const vnp_SecureHash = hmac.update(Buffer.from(data, "utf-8")).digest("hex");

    const dataObj = {
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TransactionType,
        vnp_TxnRef,
        vnp_Amount,
        vnp_TransactionNo,
        vnp_CreateBy,
        vnp_OrderInfo,
        vnp_TransactionDate,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_SecureHash,
    };

    try {
        const response = await axios.post(vnp_Api, dataObj);

        if (response.data?.RspCode === "00") {
            return res.status(200).json({
                message: "Hoàn tiền thành công",
                data: response.data,
            });
        } else {
            return res.status(400).json({
                message: `Hoàn tiền thất bại: ${response.data?.Message || "Lỗi không xác định"}`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi trong quá trình hoàn tiền",
            error: error.message,
        });
    }
}

    
export async function vnpayReturn(req, res) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        let responseCode = vnp_Params['vnp_ResponseCode'];
        return res.status(200).json({
            message: "Xử lý VNPay Return thành công",
            data: {
                responseCode: responseCode,
                transactionInfo: vnp_Params
            }
        });
    } else {
        return res.status(400).json({
            message: "Chữ ký không hợp lệ",
            data: {
                errorCode: '97',
                transactionInfo: vnp_Params
            }
        });
    }
}

export async function vnpayIPN(req, res) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.vnp_HashSecret;

    const querystring = require("qs");
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash !== signed) {
        return res.status(200).json({ RspCode: '97', Message: 'Chữ ký không hợp lệ' });
    }

    const order = await db.Order.findByPk(orderId);

    if (!order) {
        return res.status(200).json({ RspCode: '01', Message: 'Đơn hàng không tồn tại' });
    }

    const totalAmount = parseInt(vnp_Params['vnp_Amount'], 10) / 100;
    if (order.total !== totalAmount) {
        return res.status(200).json({ RspCode: '04', Message: 'Số tiền không hợp lệ' });
    }

    if (order.status !== OrderStatus.PENDING) {
        return res.status(200).json({ RspCode: '02', Message: 'Đơn hàng đã được cập nhật trạng thái thanh toán' });
    }

    if (rspCode === "00") {
        order.status = OrderStatus.DELIVERED;
        await order.save();
        return res.status(200).json({ RspCode: '00', Message: 'Giao dịch thành công, đơn hàng đã được cập nhật' });
    } else {
        order.status = OrderStatus.FAILED;
        await order.save();
        return res.status(200).json({ RspCode: '00', Message: 'Giao dịch thất bại, trạng thái đơn hàng đã được cập nhật' });
    }
}