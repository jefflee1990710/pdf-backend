import PDFObject from '../PDFObject'

export default class PDFOr extends PDFObject {

    constructor(config){
        super(config)
    }

    in(){
        return []
    }

    found(pdfobj){
        this.hit = pdfobj
    }

    pipe(stream){
        let pdfEmptyObjects = this.in()
        for(let i in pdfEmptyObjects){
            let obj = pdfEmptyObjects[i]
            let result = obj.pipe(stream)
            if(result){
                this.filled = true
                this.found(obj)
                return result;
            }
        }
        return null
    }
}