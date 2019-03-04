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