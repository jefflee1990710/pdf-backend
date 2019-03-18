import PDFObject from "./PDFObject";
import PDFCmd from "./PDFCmd";
import PDFAnd from "./condition/PDFAnd";
import PDFReal from "./PDFReal";
import PDFSpace from "./PDFSpace";
import PDFOr from "./condition/PDFOr";
import PDFStreamContent from "./PDFStreamContent";
import PDFDict from "./PDFDict";
import { InvalidPDFFormatError } from "../error";

export default class PDFIndirectObject extends PDFObject {

    constructor(config){
        super(config);
    }

    receiveElement(element, index){
        console.log('Element received : ', element, "at", index);
    }

    receiveElements(elements){
        this.elements = elements;
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        let name = new PDFIndirectObjectName();
        let result = name.pipe(stream);
        if(!result){
            stream.restorePosition(addr);
            return null;
        }

        new PDFSpace().pipe(stream);

        let elements = [];
        let cnt = 0;
        while(true){

            cnt ++;

            let oc = new PDFIndirectObjectElement();
            let ocResult = oc.pipe(stream);
            if(ocResult){
                elements.push(oc.hit);
                this.receiveElement(oc.hit, cnt - 1);
            }

            new PDFSpace().pipe(stream);

            let endCmd = new PDFCmd("endobj");
            let endobjResult = endCmd.pipe(stream);
            if(endobjResult){
                stream.cleanPosition(addr);
                this.filled = true;
                this.receiveElements(elements);
                return this.pos = {
                    start, length : (stream.position - start)
                };
            }

            if(!ocResult && !endobjResult){
                throw new InvalidPDFFormatError("Invalid indirect object structure - non ending or acceptable content detected!");
            }
        }

    }
}

class PDFIndirectObjectName extends PDFAnd {

    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFReal({name : 'objectNumber'}),
            new PDFSpace(), 
            new PDFReal({name : 'generatorNumber'}),
            new PDFSpace(), 
            new PDFCmd('obj')
        ];
    }
}

class PDFIndirectObjectElement extends PDFOr {

    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFStreamContent(),
            new PDFDict()
        ];
    }
}