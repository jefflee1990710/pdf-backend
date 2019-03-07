import PDFAnd from "./condition/PDFAnd";
import PDFCmd from "./PDFCmd";

export default class PDFNull extends PDFAnd {

    constructor(config){
        super(config)
    }

    in(){
        return [
            new PDFCmd('null')
        ]
    }

}