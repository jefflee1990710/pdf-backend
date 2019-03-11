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
        super(config)
    }


    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let name = new PDFIndirectObjectName()
        let result = name.pipe(stream)
        if(!result){
            stream.restorePosition(addr)
            return null
        }
        new PDFSpace().pipe(stream)

        let content = []
        while(true){

            let oc = new PDFIndirectObjectContent()
            let ocResult = oc.pipe(stream)
            if(ocResult){
                content.push(oc.hit)
            }

            new PDFSpace().pipe(stream)

            let endCmd = new PDFCmd("endobj")
            let endobjResult = endCmd.pipe(stream)
            if(endobjResult){
                stream.cleanPosition(addr)
                this.filled = true
                this.content = content
                return this.pos = {
                    start, length : (stream.position - start)
                }
            }

            if(!ocResult && !endobjResult){
                throw new InvalidPDFFormatError("Invalid indirect object structure - non ending or acceptable content detected!")
            }
        }

        

    }
}

class PDFIndirectObjectName extends PDFAnd {

    constructor(config){
        super(config)
    }

    in(){
        return [
            new PDFReal({name : 'objectNumber'}),
            new PDFSpace(), 
            new PDFReal({name : 'generatorNumber'}),
            new PDFSpace(), 
            new PDFCmd('obj')
        ]
    }
}

class PDFIndirectObjectContent extends PDFOr {

    constructor(config){
        super(config)
    }

    in(){
        return [
            new PDFStreamContent(),
            new PDFDict()
        ]
    }
}