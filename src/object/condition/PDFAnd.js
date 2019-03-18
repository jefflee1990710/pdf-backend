import PDFObject from '../PDFObject';

export default class PDFAnd extends PDFObject {

    constructor(config){
        super(config);
        this.content = {};
    }

    in(){
        return [];
    }

    set(fieldname, obj){
        this.content[fieldname] = obj;
    }

    get(fieldname){
        return this.content[fieldname];
    }

    pipe(stream){
        let start = stream.position;
        let addr = stream.savePosition();
        let ins = this.in();
        for(let i in ins){
            let obj = ins[i];
            let result = obj.pipe(stream);
            if(!result){
                stream.restorePosition(addr);
                return null;
            }
        }
        this.objectMap = {};
        for(let i in ins){
            let obj = ins[i];
            if(obj.config.name){
                this.content[obj.config.name] = obj;
            }
        }
        stream.cleanPosition(addr);
        this.filled = true;
        return this.pos = {
            start, length : (stream.position - start)
        };
    }

    toJSON(){
        let result = {};
        for(let i in Object.keys(this.content)){
            let fieldname = Object.keys(this.content)[i];
            result[fieldname] = this.content[fieldname].toJSON();
        }
        return result;
    }
}