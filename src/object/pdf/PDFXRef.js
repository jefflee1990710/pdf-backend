
export default class PDFXRef {

    constructor(root, info, prev, objectTable){
        this.root = root
        this.info = info
        this.prev = prev
        this.objectTable = objectTable || []
    }

    addUncompressedObjectRecord(objectNumber, generationNumber, offset){
        this.objectTable.push(new UncompressedObjectOffsetRecord(objectNumber, generationNumber, offset))
    }

    addCompressedObjectRecord(objectNumber, objectStreamObjectNumber, offsetInStream){
        this.objectTable.push(new CompressedObjectOffsetRecord(objectNumber, objectStreamObjectNumber, offsetInStream))
    }

    searchOffsetRecord(objectNumber, generationNumber){
        for(let i in this.objectTable){
            let row = this.objectTable[i]
            if(row.objectNumber === objectNumber && row.generationNumber === generationNumber){
                return row
            }
        }
        return null
    }

    searchOffsetRecordByReferenceString(objectReferenceStr){
        for(let i in this.objectTable){
            let row = this.objectTable[i]
            if(`${row.objectNumber} ${row.generationNumber} R` === objectReferenceStr){
                return row
            }
        }
        return null
    }

    get rootObjectOffset(){
        if(!this.root){
            return null
        }
        return this.searchOffsetRecord(this.root.objectNumber.value, this.root.generationNumber.value)
    }

}

export class UncompressedObjectOffsetRecord {

    constructor(objectNumber, generationNumber, offset){
        this.objectNumber = objectNumber
        this.generationNumber = generationNumber
        this.offset = offset
    }

    getObjectName(){
        return `${this.objectNumber} ${this.generationNumber} R`
    }
}

export class CompressedObjectOffsetRecord {

    constructor(objectNumber, objectStreamObjectNumber, offsetInStream){
        this.objectNumber = objectNumber
        this.generationNumber = 0
        this.objectStreamObjectNumber = objectStreamObjectNumber
        this.offsetInStream = offsetInStream
    }

    getObjectName(){
        return `${this.objectNumber} ${this.generationNumber} R`
    }
}