import PDFCmd from "./PDFCmd";
import PDFObject from "./PDFObject";
import PDFLineBreak from './PDFLineBreak';
import PDFOr from "./condition/PDFOr";

export default class PDFStreamContent extends PDFObject {

    constructor(config){
        super(config);
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        if(!new PDFCmd('stream').pipe(stream)){
            stream.restorePosition(addr);
            return null;
        }

        new PDFLineBreak().pipe(stream);

        let content = [];
        while(true){
            if(new PDFStreamContentEnd().pipe(stream)){
                stream.cleanPosition(addr);
                this.filled = true;
                this.buffer = Buffer.from(content);
                return this.pos = {
                    start, length : (stream.position - start)
                };
            }else{
                let ch = stream.getByte();
                content.push(ch);
            }
        }
    }

}

class PDFStreamContentEnd extends PDFOr {

    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFCmd('\nendstream'),
            new PDFCmd('\rendstream'),
            new PDFCmd('\r\nendstream')
        ];
    }

}