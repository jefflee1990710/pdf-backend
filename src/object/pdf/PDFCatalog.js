import PDFIndirectObject from '../PDFIndirectObject'

export default class PDFCatalog extends PDFIndirectObject{

    constructor(config){
        super(config)
    }

    receiveElement(elem){
        switch(elem.constructor.name){
            case "PDFDict":
                this.dict = elem
                break;
            case "PDFObjectReference":
                this.name = elem
                break;
        }
    }

    toJSON(){
        return this.dict.toJSON()
    }

}