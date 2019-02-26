export class ReaderOffsetExceedLimitError extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, ReaderOffsetExceedLimitError)
        this.name = "ReaderOffsetExceedLimitError"
    }
}

export class InvalidPDFFormatError extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, InvalidPDFFormatError)
        this.name = "InvalidPDFFormatError"
    }
}

export class FormattedObjectNotFillError extends Error {
    constructor(...args){
        super(...args)
        Error.captureStackTrace(this, FormattedObjectNotFillError)
        this.name = "FormattedObjectNotFillError"
    }
}