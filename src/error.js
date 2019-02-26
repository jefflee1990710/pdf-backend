export class InvalidPDFFormatError extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, InvalidPDFFormatError)
        this.name = "InvalidPDFFormatError"
    }
}