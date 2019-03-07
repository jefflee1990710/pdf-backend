export default class PDFObject {

    constructor(config = {}){
        this.filled = false
        if(config.name){
            this.name = config.name
        }
    }

}