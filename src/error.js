export class ReaderOffsetExceedLimitError extends Error {
    constructor(...args){
        super(...args);
        Error.captureStackTrace(this, ReaderOffsetExceedLimitError);
        this.name = "ReaderOffsetExceedLimitError";
    }
}

export class InvalidPDFFormatError extends Error {
    constructor(...args){
        super(...args);
        Error.captureStackTrace(this, InvalidPDFFormatError);
        this.name = "InvalidPDFFormatError";
    }
}

export class RestorePositionError extends Error {
    constructor(...args){
        super(...args);
        Error.captureStackTrace(this, RestorePositionError);
        this.name = "RestorePositionError";
    }
}

export class InvalidParameterError extends Error {
    constructor(...args){
        super(...args);
        Error.captureStackTrace(this, RestorePositionError);
        this.name = "InvalidParameterError";
    }
}