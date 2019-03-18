import PDFCmd from "./PDFCmd";

export default class PDFNull extends PDFCmd {

    constructor(config){
        super('null', config);
    }

    toJSON(){
        return null;
    }

}