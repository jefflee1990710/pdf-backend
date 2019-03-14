import {FileReader} from '../../reader'
import {InvalidPDFFormatError} from '../../error'
import logger from '../../logger'
import PDFXRefTable from './PDFXrefTable';
import PDFReal from '../PDFReal';
import PDFCmd from '../PDFCmd';
import PDFSpace from '../PDFSpace';
import PDFTrailer from './PDFTrailer'
import PDFXRefStream from './PDFXRefStream';
import PDFXRef from './PDFXRef';
import FilterInflate from '../../filter/FilterInflate';
import PDFCatalog from './PDFCatalog'
import BufferStream from '../../buffer-stream';

export default class PDFDocument {

    constructor(path){
        let reader = new FileReader(path)
        this.stream = reader.toStream()
    }

    get catalog(){
        let offset = this.xref.rootObjectOffset.offset
        logger.debug(`Parsing object at offset ${offset}`)
        this.stream.reset()
        this.stream.moveTo(offset)

        let obj = new PDFCatalog()
        let result = obj.pipe(this.stream)
        if(result){
            return obj
        }else{
            return null
        }
    }


    get isLinearization(){

        return false
    }

    get startXRefOffset(){
        let startXrefStr = 'startxref'

        if(this.isLinearization){
            // Do something if pdf is Linearization
            return null
        }else{
            this.stream.reset()
            let found = this.stream.findBackward(startXrefStr, -1)
            if(found){
                new PDFCmd(startXrefStr).pipe(this.stream)
                new PDFSpace().pipe(this.stream)
                let offset = new PDFReal()
                let result = offset.pipe(this.stream)
                if(result){
                    logger.debug('PDF last xref offset found at file position ' + result.start + ' and length : ' + result.length)
                    return offset.value
                }else{
                    throw new InvalidPDFFormatError(`Invalid PDF Format - Error when trying to parse expected xrefoffset in PDF file`)
                }
            }else{
                throw new InvalidPDFFormatError('Invalid PDF Format - Keyword "startxref" not found in the PDF file.')
            }
        }
    }

    async getAllXRef(){
        let offset = this.startXRefOffset
        logger.debug("#getAllXRef - document startXRefOffet at " + offset)
        let xrefList = []
        while(true){
            let xref = await parseXRefTableByOffset(this.stream, offset)
            if(!xref) {xref = await parseXRefStreamByOffset(this.stream, offset)}

            xrefList.push(xref)
            if(xref.prev === null){
                break
            }else{
                let newOffset = getXRefOffsetByOffset.apply(this, [this.stream, xref.prev.value])   
                if(newOffset === null){ // xref.prev.value is a xref stream, dont have xrefoffset
                    offset = xref.prev.value
                }else{
                    offset = newOffset
                }
            }
        }
        xrefList = xrefList.reverse()
        return xrefList
    }

    async getMasterXRef(){
        let xrefList = this.getAllXRef()

        let root = null
        let info = null
        let objectMap = {}
        for(let i in xrefList){
            let xref = xrefList[i]
            if(xref.info) {info = xref.info}
            if(xref.root) {root = xref.root}
            for(let o in xref.objectTable){
                let row = xref.objectTable[o]
                objectMap[row.getObjectName()] = row
            }
        }

        let objectTable = []
        for(let i in Object.keys(objectMap)){
            let objectName = Object.keys(objectMap)[i]
            objectTable.push(objectMap[objectName])
        }
        return new PDFXRef(
            root, info, null, objectTable
        )
    }

    toJSON(){
        return {
            startXRef : this.startXRef.toJSON(),
            startTrailer : this.startTrailer.toJSON()
        }
    }
}


export const getXRefOffsetByOffset = (stream, offset) => {
    stream.reset()
    stream.moveTo(offset)

    let result = new PDFCmd('startxref').pipe(stream)
    if(!result){
        return null
    }

    new PDFSpace().pipe(stream)

    let num = new PDFReal()
    result = num.pipe(stream)
    if(result){
        return num.value
    }else{
        return null
    }
}

/**
 * Get XRef from offset of the target is a XRefTable, 
 * if not, (may be it is a cross-reference stream), it will return null
 * @param {BufferStream} stream 
 * @param {number} offset 
 * @returns {PDFXRef}
 */
export const parseXRefTableByOffset = async (stream, offset) => {
    logger.debug(`Prasing xref table at offset ${offset}`)
    stream.reset()
    stream.moveTo(offset)

    let xRefTable = new PDFXRefTable()
    let result = xRefTable.pipe(stream)
    if(result){
        logger.debug('Xref table found!')
        // If it is a xref table, trailer come after
        let trailer = new PDFTrailer()
        result = trailer.pipe(stream)  
        let trailerDict = trailer.get('trailerDict') 
        
        let xref = new PDFXRef()
        xref.root = trailerDict.get('Root')
        xref.prev = trailerDict.get('Prev')
        xref.info = trailerDict.get('Info')
        
        xref.objectTable = xRefTable.objectTable

        return xref
    }else{ // maybe it is a xref stream
        return null
    }
}

/**
 * Get XRef from offset of the target is a XRefStream,
 * if not, (may be it is a cross-reference table), it will return null.
 * @param {BufferStream} stream 
 * @param {number} offset 
 */
export const parseXRefStreamByOffset = async (stream, offset) => {
    logger.debug(`Prasing xref stream at offset ${offset}`)
    stream.reset()
    stream.moveTo(offset)

    let xRefStream = new PDFXRefStream()
    let result = xRefStream.pipe(stream)
    if(result){
        let {dict, buffer} = xRefStream
        let decodeParams = dict.get('DecodeParms')

        let W = dict.get('W')
        let Size = dict.get('Size')
        let Index = dict.get('Index')
        Index = Index ? Index.elements : [0, Size.value]
        
        let xref = new PDFXRef()
        xref.root = dict.get('Root')
        xref.prev = dict.get('Prev')
        xref.info = dict.get('Info')
        
        let chain = xRefStream.getFilterChain()
        let decodedStream = await chain.decode(buffer, decodeParams.toJSON())

        /// Extract buffer to object-offset mapping
        W = W.elements.map(r => r.value)
        let startObjNumber = Index[0].value
        let objCnt = Index[1].value
        let bytePtr = 0

        let rowSize = W.reduce((a, b) => a + b)
        let objnum = startObjNumber
        for(let n = 0 ; n < objCnt; n++){
            let type = decodedStream.slice(bytePtr, bytePtr + W[0])
            let field2 = decodedStream.slice(bytePtr + W[0], bytePtr + W[0] + W[1])
            let field3 = decodedStream.slice(bytePtr + W[0] + W[1], bytePtr + W[0] + W[1] + W[2])
            type = type.readUIntBE(0, W[0])
            field2 = field2.readUIntBE(0, W[1])
            field3 = field3.readUIntBE(0, W[2])
            switch(type){
                case 0:

                    break;
                case 1: // Not compressed object
                    xref.addUncompressedObjectRecord(
                        objnum, 
                        field3, // Generation number
                        field2) // Offset
                    break;
                case 2: // Compressed object in compressed stream
                    xref.addCompressedObjectRecord(
                        objnum,
                        field2,
                        field3)
                    break;
                default:
                    throw new InvalidPDFFormatError('Invalid row type in cross-reference stream at offset : ' + offset + " which is " + String.fromCharCode(type))
            }
            bytePtr += rowSize
            objnum ++
        }
        return xref

    }else{
        return null
    }
}

export const parseObjectStreamByOffset = async (stream, offset) => {
    stream.reset()
    stream.moveTo(offset)

    let xRefStream = new PDFXRefStream()
    let result = xRefStream.pipe(stream)
    if(result){
        let {dict, buffer} = xRefStream
        let decodeParams = dict.get('DecodeParms')
        decodeParams = decodeParams ? decodeParams.toJSON() : {}

        let flate = new FilterInflate()
        buffer = await flate.decode(buffer, decodeParams)
        return xRefStream
    }else{
        return null
    }
}