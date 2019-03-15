import PDFIndirectObject from "../PDFIndirectObject";
import { InvalidPDFFormatError } from "../../error";

export default class PDFPages extends PDFIndirectObject{

    constructor(config){
        super(config)
    }

    receiveElements(){}

    receiveElement(elem){
        if(elem.constructor.name !== "PDFDict"){
            throw new InvalidPDFFormatError(`Pages object should be PDFDict, but ${elem.constructor.name} found`)
        }
        console.log('elem", elem', elem)
        if(elem.get('Type') === null){
            throw new InvalidPDFFormatError('"Type" field in PDFPages is required')
        }
        if(elem.get('Kids') === null){
            throw new InvalidPDFFormatError('"Kids" field in PDFPages is required')
        }
        if(elem.get('Count') === null){
            throw new InvalidPDFFormatError('"Count" field in PDFPages is required')
        }
        this.elem = elem
    }

    toJSON(deep){
        return {
            type : this.type.toJSON(deep),
            parent : this.parent ? this.parent.toJSON() : null,
            kids : this.kids.toJSON(deep),
            count : this.count.toJSON(deep)
        }
    }

    get type(){
        return this.elem.get('Type')
    }

    get parent(){
        return this.elem.get('Parent')
    }

    get kids(){
        return this.elem.get('Kids')
    }

    get count(){
        return this.elem.get('Count')
    }

}