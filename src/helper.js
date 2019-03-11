/**
 * Check if byte is a number or not
 * @param {number} byte 
 */
const isNumber = (byte) => {
    return (byte >= 0x30 && byte <= 0x39) // 0-9
}

/**
 * Check if byte is space or not
 * @param {number} byte 
 */
const isSpace = (byte) => {
    return (byte === 0x20);
}

/**
 * Check if byte is tab or not
 * @param {number} byte 
 */
const isTab = (byte) => {
    return (byte === 0x09)
}

/**
 * Check if byte is linebreak (CR/LF) or not
 * @param {number} byte 
 */
const isLineBreak = (byte) => {
    return (byte === 0x0D || byte === 0x0A)
}

/**
 * Make a object properties read only.
 * @param {object} obj
 * @param {string} prop 
 * @param {object} value 
 */
const readonly = (obj, prop, value) => {
    Object.defineProperty(obj, prop, {
        value : value,
        enumerable : true,
        configurable : true,
        writable : false
    })
    return value
}

const hexToAscii = (str1) => {
    let hex = str1.toString()
    let str = ''
    for(let n = 0 ; n < hex.length ; n +=2){
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
    }
    return str
}

const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const calculateRowSize = (colors, bitsPerComponent, columns) => {
    return (columns * colors * bitsPerComponent + 0b00000111) >> 3;
}

const calcSetBitSeq = (by, startBit, bitSize, val) => {
    let mask = ((1 << bitSize) - 1);
    let truncatedVal = val & mask;
    mask = ~(mask << startBit);
    return (by & mask) | (truncatedVal << startBit);
}

const getBitSeq = (by, startBit, bitSize) => {
    let mask = ((1 << bitSize) - 1);
    return (by >>> startBit) & mask;
}

  
export default {
    isNumber, 
    isSpace,
    isTab,
    isLineBreak,
    readonly,
    hexToAscii,
    deepCopy,
    calculateRowSize,
    calcSetBitSeq,
    getBitSeq
}