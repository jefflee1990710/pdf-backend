export default class PDFXRef {

    constructor(){
        this.objectTable = []
    }

    addUncompressedObjectRecord(objectNumber, generationNumber, offset){
        this.objectTable.push(new UncompressedObjectOffsetRecord(objectNumber, generationNumber, offset))
    }

    addCompressedObjectRecord(objectNumber, objectStreamObjectNumber, offsetInStream){
        this.objectTable.push(new CompressedObjectOffsetRecord(objectNumber, objectStreamObjectNumber, offsetInStream))
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
        this.objectStreamObjectNumber = objectStreamObjectNumber
        this.offsetInStream = offsetInStream
        this.generationNumber = 0
    }

    getObjectName(){
        return `${this.objectNumber} ${this.generationNumber} R`
    }
}