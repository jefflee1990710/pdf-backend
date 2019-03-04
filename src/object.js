export class PDFObject {
    constructor(val){
        this.val = val
    }

    toJson(){
        return this.val
    }
}

export class PDFSpace extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFLineBreak extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFNull extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFBoolean extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFReal extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFCmd extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFOctalBytes extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFString extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFLiteralString extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFHexadecimalString extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFName extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFArray extends PDFObject{

    constructor(val){
        super(val)
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

    constructor(val){
        super(val)
    }

    get fieldname(){
        return this.val['fieldname']
    }

    get value(){
        return this.val['value']
    }

    toJson(){
        return {
            fieldname : this.fieldname,
            value : this.value
        }
    }
}

export class PDFDict extends PDFObject{

    constructor(val){
        super(val)
    }

    toJson(){
        let obj = {}
        for(let i in this.val){
            let {val} = this.val[i]
            obj[val.fieldname.val] = val.value.toJson()
        }
        return obj
    }

}

export class PDFStream extends PDFObject{

    constructor(val){
        super(val)
    }
}

export class PDFXRefTableSectionHeader extends PDFObject {

    constructor(val){
        super(val)
    }

    get firstObjectNum(){
        return this.val['firstObjectNum']
    }

    get objectCnt(){
        return this.val['objectCnt']
    }

    toJson(){
        return {
            firstObjectNum : this.firstObjectNum,
            objectCnt : this.objectCnt
        }
    }
}

export class PDFXRefTableSectionEntry extends PDFObject {

    constructor(val){
        super(val)
    }

    get offset(){
        return this.val['offset']
    }

    get generationNumber() {
        return this.val['generationNumber']
    }

    get flag(){
        return this.val['flag']
    }

    toJson(){
        return {
            offset : this.offset,
            generationNumber : this.generationNumber,
            flag : this.flag
        }
    }
}