import PDFOr from "./condition/PDFOr";
import PDFCmd from "./PDFCmd";

export default class PDFBoolean extends PDFOr {

    constructor(config){
        super(config)
    }

    found(pdfobj){
        this.value = pdfobj.cmd === 'true' ? true : false
    }

    in(){
        return [
            new PDFCmd('true'),
            new PDFCmd('false')
        ]
    }

    toJSON(){
        return this.hit.toJSON()
    }
}