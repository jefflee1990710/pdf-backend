import PDFObject from "./PDFObject";

export default class PDFLineBreak extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()

        while(true){
            let ch = stream.getByte()

            if(ch === 0x0D){  // \r
                ch = stream.getByte()
                if(ch === 0x0A){ // \r\n
                    stream.cleanPosition(addr)
                    this.filled = true
                    return this.pos = {
                        start, length : (stream.position - start)
                    }
                }else{ // \r
                    stream.rewindPosition()
                    stream.cleanPosition(addr)
                    this.filled = true
                    return this.pos = {
                        start, length : (stream.position - start)
                    }
                }
            }else if(ch === 0x0A){ // \n
                stream.cleanPosition(addr)
                this.filled = true
                return this.pos = {
                    start, length : (stream.position - start)
                }
            }else{
                stream.restorePosition(addr)
                return null;
            }
        }
    }

}