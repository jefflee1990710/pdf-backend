import PDFObject from "./PDFObject";
import PDFSpace from "./PDFSpace"
import PDFReal from "./PDFReal"
import PDFCmd from "./PDFCmd";

import config from 'config'

export default class PDFObjectReference extends PDFObject {

    constructor(config){
        super(config)
    }

    pipe(stream){
        let addr = stream.savePosition()
        let start = stream.position

        let objectNumber = new PDFReal(config)
        if(!objectNumber.pipe(stream)){
            stream.restorePosition(addr)
            return null;
        }

        new PDFSpace(this.config).pipe(stream)

        let generationNumber = new PDFReal(config)
        if(!generationNumber.pipe(stream)){   
            stream.restorePosition(addr)
            return null;
        }

        new PDFSpace(this.config).pipe(stream)

        let R = new PDFCmd('R')
        if(R.pipe(stream)){
            stream.cleanPosition(addr)
            this.filled = true
            this.objectNumber = objectNumber
            this.generationNumber = generationNumber
            return this.pos = {
                start, length : (stream.position - start)
            }
        }else{
            stream.restorePosition(addr)
            return null;
        }
    }

    toDisplayName(){
        return `${this.objectNumber.value} ${this.generationNumber.value} R`
    }

    toJSON(){
        return this.toDisplayName()
    }
}