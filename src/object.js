export class PDFObject {


    toString(){
        return JSON.stringify(this.val)
    }

    toJson(){
        return this.val
    }
}

export class PDFSpace extends PDFObject{

}

export class PDFLineBreak extends PDFObject{

}

export class PDFNull extends PDFObject{

}

export class PDFBoolean extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFReal extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFCmd extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFOctalBytes extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFString extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFLiteralString extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFHexadecimalString extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFName extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }
}

export class PDFArray extends PDFObject{

    constructor(val){
        super()
        this.val = val
    }

    toJson(){
        let arr = []
        for(let i in this.val){
            arr.push(this.val[i].toJson())
        }
        return arr
    }
}

export class PDFDictEntry extends PDFObject{

    constructor(fieldname, value){
        super()
        this.fieldname = fieldname
        this.value = value
    }

    toJson(){
        return {
            fieldname : this.fieldname,
            value : this.value
        }
    }
}

export class PDFDict extends PDFObject{

    constructor(){
        super()
        this.entries = {}
        this.fieldnames = []
    }

    loadWithEntries(entries){
        for(let n in entries){
            let entry = entries[n]
            this.entries[entry.fieldname.val] = entry.value
            this.fieldnames.push(entry.fieldname.val)
        }
    }

    get(fieldname){
        return this.entries[fieldname]
    }

    toJson(){
        let obj = {}
        for(let i in this.fieldnames){
            let fieldname = this.fieldnames[i]
            obj[fieldname] = this.entries[fieldname].toJson()
        }
        return obj
    }

}

export class PDFStream extends PDFObject{

    constructor(buffer){
        super()
        this.buffer = buffer
    }

    toJson(){
        return {
            buffer : this.buffer
        }
    }
}

export class PDFXRefTableSectionHeader extends PDFObject {

    constructor(firstObjectNum, objectCnt){
        super()
        this.firstObjectNum = firstObjectNum
        this.objectCnt = objectCnt
    }

    toJson(){
        return {
            firstObjectNum : this.firstObjectNum,
            objectCnt : this.objectCnt
        }
    }
}

export class PDFXRefTableSectionEntry extends PDFObject {

    constructor(offset, generationNumber, flag){
        super()
        this.offset = offset
        this.generationNumber = generationNumber
        this.flag = flag
    }

    toJson(){
        return {
            offset : this.offset,
            generationNumber : this.generationNumber,
            flag : this.flag
        }
    }
}

export class PDFIndirectObject extends PDFObject{

    constructor(objectNumber, generationNumber, content){
        super()
        this.objectNumber = objectNumber
        this.generationNumber = generationNumber
        this.content = content
    }
    
    toJson(){
        let content = this.content.map((r) => r.toJson())
        return {
            objectNumber : this.objectNumber,
            generationNumber : this.generationNumber,
            content
        }
    }

    // toXrefStreamObj(){
    //     let dict = null
    //     let buffer = null
    //     return {
    //         objectNumber : this.objectNumber,
    //         generationNumber : this.generationNumber,
    //         dict, buffer
    //     }
    // }
}

export class PDFObjectReference extends PDFObject{
    
    constructor(objectNumber, generationNumber){
        super()
        this.objectNumber = objectNumber
        this.generationNumber = generationNumber
    }

    toString(){
        return `${this.objectNumber} ${this.generationNumber} R`
    }

    toJson(){
        return {
            objectNumber : this.objectNumber,
            generationNumber : this.generationNumber,
            str : this.toString()
        }
    }
    
}

export class PDFXRefTable extends PDFObject{

    constructor(sections){
        super()
        this.sections = sections
    }

}

export class PDFTrailer extends PDFObject{

    constructor(dict){
        super()
        this.size = dict.get('Size')
        this.prev = dict.get('Prev')
        this.root = dict.get('Root')
        this.encrypt = dict.get('Encrypt')
        this.info = dict.get('Info')
        this.id = dict.get('ID')
    }

}
