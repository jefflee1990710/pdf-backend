export default class PDFObject {

    constructor(config = {}){
        this.filled = false;
        this.config = config;
    }

    toJSON(){
        throw new Error("toJSON no implemented");
    }

}