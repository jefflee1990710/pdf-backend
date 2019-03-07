import PDFObject from '../PDFObject'

export default class PDFAnd extends PDFObject {

    constructor(config){
        super(config)
    }

    in(){
        return []
    }

    found(pdfobjs){
        console.log('PDFAnd hit objects : ', pdfobjs)
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()
        let pdfEmptyObjects = this.in()
        for(let i in pdfEmptyObjects){
            let obj = pdfEmptyObjects[i]
            let result = obj.pipe(stream)
            if(!result){
                stream.restorePosition(addr)
                return null;
            }
        }
        this.found(pdfEmptyObjects)
        this.objectMap = {}
        for(let i in pdfEmptyObjects){
            let obj = pdfEmptyObjects[i]
            if(obj.name){
                this.objectMap[obj.name] = obj
            }
        }
        stream.cleanPosition(addr)
        this.filled = true
        return this.pos = {
            start, length : (stream.position - start)
        }

    }
}