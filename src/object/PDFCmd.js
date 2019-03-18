import PDFObject from "./PDFObject";

import config from 'config';

export default class PDFCmd extends PDFObject {

    constructor(cmd, config){
        super(config);
        this.cmd = cmd;
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        let cmdBuf = Buffer.from(this.cmd, config.get('pdf.encoding'));
        let cnt = 0;
        while(true){
            let ch = stream.getByte();

            if(ch != cmdBuf[cnt]){
                stream.restorePosition(addr);
                return null;
            }

            if(cnt == cmdBuf.length - 1){
                stream.cleanPosition(addr);
                this.filled = true;
                return this.pos = {
                    start, length : (stream.position - start)
                };
            }
            cnt ++;
        }
    }

    toJSON(){
        return this.cmd;
    }

}