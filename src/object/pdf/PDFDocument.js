import {FileReader} from '../../reader';
import {InvalidPDFFormatError} from '../../error';
import PDFXRefTable from './PDFXrefTable';
import PDFReal from '../PDFReal';
import PDFCmd from '../PDFCmd';
import PDFSpace from '../PDFSpace';
import PDFTrailer from './PDFTrailer';
import PDFXRefStream from './PDFXRefStream';
import PDFXRef from './PDFXRef';
import PDFCatalog from './PDFCatalog';

export default class PDFDocument {

    constructor(path){
        if(path){ this.load(path); }
    }

    load(path){
        let reader = new FileReader(path);
        this.stream = reader.toStream();
        
        // Parse document structure
        this.isLinearization = isLinearization.apply(this);
        this.allXRef = getAllXRef.apply(this);
        this.xRef = getMasterXRef.apply(this);
        this.catalog = getCatalog.apply(this);
    }

    toJSON(){
        return {
            startXRef : this.startXRef.toJSON(),
            startTrailer : this.startTrailer.toJSON()
        };
    }
}

export function getPDFObjectByOffset(offset, objectClazz){
    this.stream.reset();
    this.stream.moveTo(offset);

    let obj = new objectClazz(this.config);
    let result = obj.pipe(this.stream);
    if(result){
        return obj;
    }else{
        return null;
    }
}

export function isLinearization(){

    return false;
}

export function getStartXRefOffset(){
    let startXrefStr = 'startxref';

    if((isLinearization())){
        // Do something if pdf is Linearization
        return null;
    }else{
        this.stream.reset();
        let found = this.stream.findBackward(startXrefStr, -1);
        if(found){
            new PDFCmd(startXrefStr).pipe(this.stream);
            new PDFSpace().pipe(this.stream);
            let offset = new PDFReal();
            let result = offset.pipe(this.stream);
            if(result){
                return offset.value;
            }else{
                throw new InvalidPDFFormatError(`Invalid PDF Format - Error when trying to parse expected xrefoffset in PDF file`);
            }
        }else{
            throw new InvalidPDFFormatError('Invalid PDF Format - Keyword "startxref" not found in the PDF file.');
        }
    }
}

export function getMasterXRef(){
    let xrefList = this.allXRef;

    let root = null;
    let info = null;
    let objectMap = {};
    for(let i in xrefList){
        let xref = xrefList[i];
        if(xref.info) {info = xref.info;}
        if(xref.root) {root = xref.root;}
        for(let o in xref.objectTable){
            let row = xref.objectTable[o];
            objectMap[row.getObjectName()] = row;
        }
    }

    let objectTable = [];
    for(let i in Object.keys(objectMap)){
        let objectName = Object.keys(objectMap)[i];
        objectTable.push(objectMap[objectName]);
    }
    return new PDFXRef(
        root, info, null, objectTable
    );
}

export function getAllXRef(){
    let offset = getStartXRefOffset.apply(this);
    let xrefList = [];
    while(true){
        let xref = parseXRefTableByOffset.apply(this, [offset]);
        if(!xref) {xref = parseXRefStreamByOffset.apply(this, [offset]);}

        xrefList.push(xref);
        if(xref.prev === null){
            break;
        }else{
            let newOffset = getXRefOffsetByOffset.apply(this, [xref.prev.value]);   
            if(newOffset === null){ // xref.prev.value is a xref stream, dont have xrefoffset
                offset = xref.prev.value;
            }else{
                offset = newOffset;
            }
        }
    }
    xrefList = xrefList.reverse();
    return xrefList;
}

export function getCatalog(){
    let offset = this.xRef.rootObjectOffset.offset;
    this.stream.reset();
    this.stream.moveTo(offset);

    let obj = new PDFCatalog({
        document : this
    });
    let result = obj.pipe(this.stream);
    if(result){
        return obj;
    }else{
        return null;
    }
}

export function getXRefOffsetByOffset(offset) {
    if(offset === null || offset === undefined) {
        throw new InvalidPDFFormatError(`Offset can't be null or undefined`);
    }

    this.stream.reset();
    this.stream.moveTo(offset);

    let result = new PDFCmd('startxref').pipe(this.stream);
    if(!result){
        return null;
    }

    new PDFSpace().pipe(this.stream);

    let num = new PDFReal();
    result = num.pipe(this.stream);
    if(result){
        return num.value;
    }else{
        return null;
    }
}

/**
 * Get XRef from offset of the target is a XRefTable, 
 * if not, (may be it is a cross-reference stream), it will return null
 * @param {number} offset 
 * @returns {PDFXRef}
 */
export function parseXRefTableByOffset(offset) {
    if(offset === null || offset === undefined) {
        throw new InvalidPDFFormatError(`Offset can't be null or undefined`);
    }

    this.stream.reset();
    this.stream.moveTo(offset);

    let xRefTable = new PDFXRefTable();
    let result = xRefTable.pipe(this.stream);
    if(result){
        // If it is a xref table, trailer come after
        let trailer = new PDFTrailer();
        result = trailer.pipe(this.stream);  
        let trailerDict = trailer.get('trailerDict'); 
        
        let xref = new PDFXRef();
        xref.root = trailerDict.get('Root');
        xref.prev = trailerDict.get('Prev');
        xref.info = trailerDict.get('Info');
        
        xref.objectTable = xRefTable.objectTable;

        return xref;
    }else{ // maybe it is a xref stream
        return null;
    }
}

/**
 * Get XRef from offset of the target is a XRefStream,
 * if not, (may be it is a cross-reference table), it will return null.
 * @param {number} offset 
 */
export function parseXRefStreamByOffset(offset) {
    if(offset === null || offset === undefined) {
        throw new InvalidPDFFormatError(`Offset can't be null or undefined`);
    }

    this.stream.reset();
    this.stream.moveTo(offset);

    let xRefStream = new PDFXRefStream();
    let result = xRefStream.pipe(this.stream);
    if(result){
        let {dict, buffer} = xRefStream;
        let decodeParams = dict.get('DecodeParms');

        let W = dict.get('W');
        let Size = dict.get('Size');
        let Index = dict.get('Index');
        Index = Index ? Index.elements : [0, Size.value];
        
        let xref = new PDFXRef();
        xref.root = dict.get('Root');
        xref.prev = dict.get('Prev');
        xref.info = dict.get('Info');
        
        let chain = xRefStream.getFilterChain();
        let decodedStream = chain.decode(buffer, decodeParams.toJSON());

        /// Extract buffer to object-offset mapping
        W = W.elements.map(r => r.value);
        let startObjNumber = Index[0].value;
        let objCnt = Index[1].value;
        let bytePtr = 0;

        let rowSize = W.reduce((a, b) => a + b);
        let objnum = startObjNumber;
        for(let n = 0 ; n < objCnt; n++){
            let type = decodedStream.slice(bytePtr, bytePtr + W[0]);
            let field2 = decodedStream.slice(bytePtr + W[0], bytePtr + W[0] + W[1]);
            let field3 = decodedStream.slice(bytePtr + W[0] + W[1], bytePtr + W[0] + W[1] + W[2]);
            type = type.readUIntBE(0, W[0]);
            field2 = field2.readUIntBE(0, W[1]);
            field3 = field3.readUIntBE(0, W[2]);
            switch(type){
                case 0:

                    break;
                case 1: // Not compressed object
                    xref.addUncompressedObjectRecord(
                        objnum, 
                        field3, // Generation number
                        field2); // Offset
                    break;
                case 2: // Compressed object in compressed stream
                    xref.addCompressedObjectRecord(
                        objnum,
                        field2,
                        field3);
                    break;
                default:
                    throw new InvalidPDFFormatError('Invalid row type in cross-reference stream at offset : ' + offset + " which is " + String.fromCharCode(type));
            }
            bytePtr += rowSize;
            objnum ++;
        }
        return xref;

    }else{
        return null;
    }
}