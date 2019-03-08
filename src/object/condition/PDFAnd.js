import PDFDict from '../PDFDict'

export default class PDFAnd extends PDFDict {

    constructor(config){
        super(config)
    }

    in(){
        return []
    }

    pipe(stream){
        let start = stream.position
        let addr = stream.savePosition()
        let ins = this.in()
        for(let i in ins){
            let obj = ins[i]
            let result = obj.pipe(stream)
            if(!result){
                stream.restorePosition(addr)
                return null;
            }
        }
        this.objectMap = {}
        for(let i in ins){
            let obj = ins[i]
            if(obj.name){
                this.set(obj.name, obj)
            }
        }
        stream.cleanPosition(addr)
        this.filled = true
        return this.pos = {
            start, length : (stream.position - start)
        }

    }
}