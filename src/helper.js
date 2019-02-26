import constant from './constant'

/**
 * Check if "num" is a number or not
 * @param {number} num 
 */
export function isNumber(byte){
    return (byte >= constant.NUMBER_RANGE[0] && byte <= constant.NUMBER_RANGE[1])
}

/**
 * Check if byte is space or tab or linebreak or not
 * @param {number} byte 
 */
export function isSpace(byte){
    return (byte === 0x20 || byte === 0x09 || byte === 0x0D || byte === 0x0A);
}

export function readonly(obj, prop, value){
    Object.defineProperty(obj, prop, {
        value : value,
        enumerable : true,
        configurable : true,
        writable : false
    })
    return value
}