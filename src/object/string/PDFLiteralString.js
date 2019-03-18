import PDFCmd from "../PDFCmd";
import PDFObject from "../PDFObject";

import config from 'config';


export default class PDFLiteralString extends PDFObject {

    constructor(cmd, config){
        super(config);
        this.cmd = cmd;
    }

    start(){
        return new PDFCmd('(');
    }

    end(){
        return new PDFCmd(')');
    }

    pipe(stream){
        let start = stream.position;
        let addr = stream.savePosition();
        let startObj = this.start();
        let startResult = startObj.pipe(stream);
        if(startResult === null){
            stream.restorePosition(addr);
            return null;
        }

        let buffer = [];
        let pareCnt = 1;
        while(true){
            let endCmd = this.end();
            let startCmd = this.start();
            if(endCmd.pipe(stream)){
                if(pareCnt === 1){
                    stream.cleanPosition(addr);
                    this.filled = true;
                    this.buffer = Buffer.from(buffer);
                    return this.pos = {
                        start, length : (stream.position - start)
                    };
                }else{
                    buffer.push(0x29);
                    pareCnt --;
                }
            }
            if(startCmd.pipe(stream)){
                buffer.push(0x28);
                pareCnt ++;
            }

            let ch = stream.getByte();
            if(ch === null){
                stream.restorePosition(addr);
                return null;
            }else{
                buffer.push(ch);
            }

        }
    }

    toString(){
        return this.buffer.toString(config.get('pdf.encoding'));
    }

    toJSON(){
        return this.buffer.toString(config.get('pdf.encoding'));
    }

}