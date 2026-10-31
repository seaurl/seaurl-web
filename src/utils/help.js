// 将平级转换成层级
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

const tile2nest = (array, key, pKey, childrenKey) => {
    if (!array || array.constructor !== Array) {
        return array
    }
    // 复制一份，避免修改原始数组
    let ary = [...array]
    key = key || 'id'
    pKey = pKey || 'pid'
    childrenKey = childrenKey || 'children'
    // 定义一个待移除数组
    let ary2remove = []
    ary.map(item => {
        if (item[key] !== item[pKey]) {
            // 找父节点
            let p = ary.filter(c => c[key] === item[pKey])
            if (p && p.length == 1) {
                p[0].children = p[0].children || []
                // 将子节点放到父节点中
                p[0].children.push(item)
                ary2remove.push(item[key])
            }
        }
    })
    // 遍历移除待删除对象
    ary2remove.map(item => {
        ary = ary.filter(c => c[key] !== item)
    })
    return ary
}

// 获取当前 10 位时间戳（以秒为单位）
const getCurrentUnixTimestamp10 = () => {
    try {
        return dayjs().unix();
    } catch (e) {
        return ''
    }
};

// 获取当前 13 位时间戳（以毫秒为单位）
const getCurrentUnixTimestamp13 = () => {
    try {
        return dayjs().valueOf();
    } catch (e) {
        return ''
    }
};

// 函数定义
function fromUnixTimestamp10(timestamp) {
    try {
        return dayjs.unix(parseInt(timestamp));
    } catch (e) {
        return ''
    }
}

function fromUnixTimestamp13(timestamp) {
    try {
        return dayjs(parseInt(timestamp));
    } catch (e) {
        return ''
    }
}

function toUnixTimestamp10(str) {
    try {
        const date = dayjs(str); // 将字符串解析为 Day.js 对象
        if (date.isValid()) { // 确认日期对象有效
            return date.unix(); // 返回 Unix 时间戳（秒）
        } else {
            return '';
        }
    } catch (e) {
        return '';
    }
}

function toUnixTimestamp13(str) {
    try {
        const date = dayjs(str); // 将字符串解析为 Day.js 对象
        if (date.isValid()) { // 确认日期对象有效
            return date.valueOf(); // 返回 Unix 时间戳（毫秒）
        } else {
            return '';
        }
    } catch (e) {
        return '';
    }
}

// MD5 哈希
function hashMD5(message) {
    try {
        return CryptoJS.MD5(message).toString();
    } catch (e) {

    }
    return ''
}

// 生成 32 位 MD5 哈希
function generate32BitMD5(message) {
    try {
        return hashMD5(message);
    } catch (e) {

    }
    return ''
}

// 生成 16 位 MD5 哈希
function generate16BitMD5(message) {
    try {
        const fullHash = hashMD5(message);
        return fullHash.substring(8, 24);  // 取中间16位
    } catch (e) {

    }
    return ''
}


// DES 加密
function encryptDES(message, secretKey) {
    try {
        return CryptoJS.DES.encrypt(message, secretKey).toString();
    } catch (e) {

    }
    return ''
}

// DES 解密
function decryptDES(ciphertext, secretKey) {
    try {
        const bytes = CryptoJS.DES.decrypt(ciphertext, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {

    }
    return ''
}


// AES 加密
function encryptAES(message, secretKey) {
    try {
        return CryptoJS.AES.encrypt(message, secretKey).toString();
    } catch (e) {

    }
    return ''
}

// AES 解密
function decryptAES(ciphertext, secretKey) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {

    }
    return ''
}

function encodeToBase64(str) {
    try {
        const utf8Bytes = new TextEncoder().encode(str);
        const base64String = btoa(String.fromCharCode.apply(null, utf8Bytes));
        return base64String;
    } catch (e) {

    }
}

function decodeFromBase64(base64Str) {
    try {
        const binaryString = atob(base64Str);
        const binaryLength = binaryString.length;
        const bytes = new Uint8Array(binaryLength);
        for (let i = 0; i < binaryLength; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedStr = new TextDecoder().decode(bytes);
        return decodedStr;
    } catch (e) {

    }

}

function encodeToUnicode(str) {
    try {
        return encodeURIComponent(str).split('').map(char => {
            const code = char.charCodeAt(0).toString(16).toUpperCase();
            return '\\u' + ('0000' + code).slice(-4);
        }).join('');
    } catch (e) {

    }

}

function decodeFromUnicode(str) {
    try {
        const encodedStr = str.replace(/\\u[\dA-Fa-f]{4}/g, match => {
            return String.fromCharCode(parseInt(match.replace('\\u', ''), 16));
        });
        return decodeURIComponent(encodedStr);
    } catch (e) {

    }
}

function generateGUID() {
    try {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    } catch (e) {

    }
    return ''
}

// 解码 JWT（不验证签名）
function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (err) {
        console.error('Error decoding token:', err.message);
        return null;
    }
}

// Base64url 编码
function base64urlEncode(str) {
    return str.toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Function to decode a JWT token
function decodeBase64Url(base64Url) {
    base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64Url.length % 4) {
        case 2:
            base64Url += '==';
            break;
        case 3:
            base64Url += '=';
            break;
    }
    const decodedString = CryptoJS.enc.Base64.parse(base64Url);
    return decodedString.toString(CryptoJS.enc.Utf8);
}

// 生成带空密钥的 JWT
// secret可以为空
function generateTokenWithEmptySecret(payload, secret) {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = base64urlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(header)));
    const encodedPayload = base64urlEncode(CryptoJS.enc.Utf8.parse(JSON.stringify(payload)));

    // 用空字符串作为密钥生成签名
    const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, secret);
    const encodedSignature = base64urlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// 解析token
function parseJwt(token, secretKey) {
    const [header, payload, signature] = token.split('.');

    const decodedHeader = decodeBase64Url(header);
    const decodedPayload = decodeBase64Url(payload);

    // Verify the signature
    const data = `${header}.${payload}`;
    const expectedSignature = CryptoJS.HmacSHA256(data, secretKey);
    const encodedExpectedSignature = base64urlEncode(CryptoJS.enc.Base64.stringify(expectedSignature));

    if (encodedExpectedSignature !== signature) {
        throw new Error('Invalid token signature');
    }

    return {
        header: JSON.parse(decodedHeader),
        payload: JSON.parse(decodedPayload),
        signature: signature,
    };
}


function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function isObject(value) {
    return value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
}

function isHTML(str) {
    const htmlPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlPattern.test(str);
}

function isString(value) {
    return value instanceof String || typeof value === 'string';
}

// 判断属性值是否是非字符串类型
function isNonString(value) {
    return typeof value !== 'string';
}

function isFormDataEmpty(formData) {
    const entries = formData.entries();
    for (let pair of entries) {
        // 如果能遍历到任何键值对，则表单数据不为空
        return false;
    }
    // 如果没有键值对，则表单数据为空
    return true;
}

function removeExtraSpaces(jsonString) {
    // 匹配键和值之间的多余空格
    return jsonString.replace(/"\s*:\s*"/g, '":"').replace(/,\s*"/g, ',"').replace(/{\s*"/g, '{"').replace(/"\s*}/g, '"}');
}

function isValidURL(url) {
    const urlRegex = /^(https?:\/\/)?((([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,})|localhost|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[a-zA-Z0-9_.-]*)*(\?[a-zA-Z0-9&=_-]*)?(#[a-zA-Z0-9_-]*)?$/;
    return urlRegex.test(url);
}

// function isValidJSON(jsonString) {
//     try {
//         JSON.parse(jsonString);
//         return true;
//     } catch (e) {
//         return false;
//     }
// }

function isUrl(url) {
    const urlReg = new RegExp(
        '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
        'i',
    )
    return url.match(urlReg)

}

function isXML(str) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(str, "application/xml");
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        return parseError.length <= 0;

    } catch (e) {
        return false;
    }
}

function isArray(value) {
    return Array.isArray(value);
}

function isValidJSON(value) {
    // 如果传入的是null或undefined，直接返回false
    if (value === null || value === undefined) {
        return false;
    }

    // 如果传入的是字符串，尝试使用JSON.parse来解析
    if (typeof value === 'string') {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 如果传入的是对象或数组，我们认为它是“正确的JSON”
    // 注意：这里并不严格，因为对象和数组不是JSON字符串，而是JSON的直接JavaScript表示
    if (typeof value === 'object') {
        return true;
    }

    // 如果传入的是其他类型，返回false
    return false;
}

function convertSize(size) {
    if (!size) return "";
    let num = 1024.00; //byte
    if (size < num)
        return size + "B";
    if (size < Math.pow(num, 2))
        return (size / num).toFixed(2) + "KB"; //kb
    if (size < Math.pow(num, 3))
        return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
    if (size < Math.pow(num, 4))
        return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
    return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
}

// 根据文件名获取文件类型
function getFileType(fileName) {
    let suffix = ''; // 后缀获取
    let result = ''; // 获取类型结果
    if (fileName) {
        const flieArr = fileName.split('.'); // 根据.分割数组
        suffix = flieArr[flieArr.length - 1]; // 取最后一个
    }
    if (!suffix) return false; // fileName无后缀返回false
    suffix = suffix.toLocaleLowerCase(); // 将后缀所有字母改为小写方便操作
    // 匹配图片
    const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif']; // 图片格式
    result = imgList.includes(suffix);
    if (result) return 'image';
    // 匹配txt
    const txtList = ['txt'];
    result = txtList.includes(suffix);
    if (result) return 'txt';
    // 匹配excel
    const excelList = ['xls', 'xlsx'];
    result = excelList.includes(suffix);
    if (result) return 'excel';
    // 匹配word
    const wordList = ['doc', 'docx'];
    result = wordList.includes(suffix);
    if (result) return 'word';
    // 匹配pdf
    const pdfList = ['pdf'];
    result = pdfList.includes(suffix);
    if (result) return 'pdf';
    // 匹配ppt
    const pptList = ['ppt', 'pptx'];
    result = pptList.includes(suffix);
    if (result) return 'ppt';
    // 匹配zip
    const zipList = ['rar', 'zip', '7z', 'dmg'];
    result = zipList.includes(suffix);
    if (result) return 'zip';
    // 匹配视频
    const videoList = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v'];
    result = videoList.includes(suffix);
    if (result) return 'video';
    // 匹配音频
    const radioList = ['mp3', 'wav', 'wmv'];
    result = radioList.includes(suffix);
    if (result) return 'radio';
    // 其他文件类型
    return 'other';
}


function sortFolderList(data) {
    const children = data.mailFolderList?.map(d => {
        let name = d.name
        let folderName = d.name
        if (d.name.toLowerCase() === 'inbox') {
            name = '收件箱'
        }
        if (d.name.toLowerCase() === 'sent messages') {
            name = '已发送'
        }
        if (d.name.toLowerCase() === 'drafts') {
            name = '草稿箱'
        }
        if (d.name.toLowerCase() === 'deleted messages') {
            name = '已删除'
        }
        if (d.name.toLowerCase() === 'junk') {
            name = '垃圾邮件'
        }
        return {
            id: d.id,
            name: name,
            email: data.email,
            folderName: folderName
        }
    })
    // children.push({
    //     id: generateGUID(),
    //     name: '未读邮件',
    //     email: res.email,
    //     folderName: 'unread'
    // })
    // children.push({
    //     id: generateGUID(),
    //     name: '红旗邮件',
    //     email: res.email,
    //     folderName: 'redFlag'
    // })
    children.forEach(item => {
        if (item.name === '收件箱') {
            item.sort = 1
        } else if (item.name === '未读邮件') {
            item.sort = 2
        } else if (item.name === '红旗邮件') {
            item.sort = 3
        } else if (item.name === '草稿箱') {
            item.sort = 4
        } else if (item.name === '已发送') {
            item.sort = 5
        } else if (item.name === '已删除') {
            item.sort = 6
        } else if (item.name === '垃圾邮件') {
            item.sort = 7
        } else if (item.name === '病毒邮件') {
            item.sort = 8
        } else if (item.name === '广告邮件') {
            item.sort = 9
        } else if (item.name === '订阅邮件') {
            item.sort = 10
        } else if (item.name === 'Deleted Items') {
            item.sort = 11
        } else {
            item.sort = 100
        }
    })
    children.sort((a, b) => a.sort - b.sort)
    return children
}

function isEmail(email) {
    const testEmail = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/);
    return testEmail.test(email);
}

function isExcel(file){
    if (file.name){
        // 检查文件类型
        const isXls = /\.(xls|xlsx)$/i.test(file.name) ||
            file.type === 'application/vnd.ms-excel' ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        return isXls
    }else{
        return false
    }
}

function isWord(file){
    if (file.name){
        // 检查文件类型
        const isWord = /\.(doc|docx)$/i.test(file.name) ||
            file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return isWord
    }else{
        return false
    }
}

const readExcel = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return jsonData;
};

const readDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const readPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        text += pageText + '\n';
    }
    return text;
};

const readText = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};


export {
    isEmail,
    getFileType,
    convertSize,
    isArray,
    isXML,
    isUrl,
    isValidJSON,
    isValidURL,
    removeExtraSpaces,
    isFormDataEmpty,
    isNonString,
    isObject,
    isString,
    isJSON,
    isHTML,
    tile2nest,
    fromUnixTimestamp10,
    fromUnixTimestamp13,
    toUnixTimestamp10,
    toUnixTimestamp13,
    generate32BitMD5,
    generate16BitMD5,
    encryptDES,
    decryptDES,
    encryptAES,
    decryptAES,
    encodeToBase64,
    decodeFromBase64,
    getCurrentUnixTimestamp10,
    getCurrentUnixTimestamp13,
    encodeToUnicode,
    decodeFromUnicode,
    generateGUID,
    decodeToken,
    parseJwt,
    generateTokenWithEmptySecret,
    sortFolderList,
    isExcel,
    isWord,
    readExcel,
    readText,
    readDocx,
    readPdf
}
