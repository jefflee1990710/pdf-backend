import PDFCmd from "../PDFCmd";
import PDFObject from "../PDFObject";

import config from 'config'


export default class PDFHexadecimalString extends PDFObject {

    constructor(cmd, config){
        super(config)
        this.cmd = cmd
    }

    start(){
        return new PDFCmd('<')
    }

    end(){
        return new PDFCmd('>')
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()
        let startObj = this.start()
        let startResult = startObj.pipe(stream)
        if(startResult === null){
            stream.restorePosition(addr)
            return null;
        }

        let buffer = []
        while(true){
            let endCmd = this.end();
            if(endCmd.pipe(stream)){
                stream.cleanPosition(addr)
                this.filled = true
                if(buffer.length % 2 != 0){
                    buffer.push(0x30)
                }
                this.buffer = Buffer.from(buffer)
                return this.pos = {
                    start, length : (stream.position - start)
                }
            }
            let ch = stream.getByte()
            if(ch === null){
                stream.restorePosition(addr)
                return null;
            }else{
                buffer.push(ch)
            }

        }
    }

    toString(){
        return this.buffer.toString(config.get('pdf.encoding'))
    }

}