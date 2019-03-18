import fs from 'fs';

import BufferStream from './buffer-stream';
import {ReaderOffsetExceedLimitError} from './error';

export class Reader {
    toStream(start = -1, end = -1){
        if(start != -1){
            start = start - 1;
        }
        if(end === -1){
            end = this.length - 1 - start;
        }
        return new BufferStream(this);
    }
}

export class FileReader extends Reader{

    constructor(path){
        super();
        this.fd = fs.openSync(path, 'r');
    }

    get length(){
        let stat = fs.fstatSync(this.fd);
        return stat.size;
    }

    getByte(offset){
        let buffer = Buffer.alloc(1);
        let cnt = fs.readSync(this.fd, buffer, 0, buffer.length, offset);
        if(cnt === 0){
            return null;
        }
        return buffer[0];
    }

    getBytes(offset, length){
        let buffer =  Buffer.alloc(length);
        fs.readSync(this.fd, buffer, 0, buffer.length, offset);
        return buffer;
    }

}

export class ByteArrayReader extends Reader{

    constructor(byteArray){
        super();
        
        this.byteArray = byteArray;
    }

    get length(){
        return this.byteArray.length;
    }

    getByte(offset){
        if(offset > this.length - 1){
            throw new ReaderOffsetExceedLimitError(`Error when trying read data at offset larger then the source. Data size is ${this.length}, reading at offset ${offset}.`);
        }
        return Buffer.from(this.byteArray.slice(offset, offset + 1))[0];
    }

    getBytes(offset, length){
        if(offset + length > this.length){
            throw new ReaderOffsetExceedLimitError(`Error when trying read data at offset larger then the source. Data size is ${this.length}, reading at offset ${offset} and length ${length}.`);
        }
        return Buffer.from(this.byteArray.slice(offset, offset + length));
    }
}