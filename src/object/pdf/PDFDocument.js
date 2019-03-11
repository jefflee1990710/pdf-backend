import {FileReader} from '../../reader'
import {InvalidPDFFormatError} from '../../error'
import logger from '../../logger'
import PDFXRefTable from './PDFXrefTable';
import PDFReal from '../PDFReal';
import PDFCmd from '../PDFCmd';
import PDFSpace from '../PDFSpace';
import PDFTrailer from './PDFTrailer'

export default class PDFDocument {

    constructor(path){
        this.reader = new FileReader(path)
        this.stream = this.reader.toStream()
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

    getStartXRef(){
        return this._parseXRefByOffset(this.startXRefOffset)
    }

    parseXRefTableByOffset(offset){
        this.stream.reset()
        this.stream.moveTo(offset)

        let xRef = new PDFXRefTable()
        let result = xRef.pipe(this.stream)
        if(result){
            logger.debug('Xref table found!')
            // If it is a xref table, trailer come after
            let trailer = new PDFTrailer()
            result = trailer.pipe(this.stream)  
            let trailerDict = trailer.get('trailerDict') 
            return {
                xRefTable : xRef,
                root : trailerDict.get('Root'),
                prev : trailerDict.get('Prev'),
                info : trailerDict.get('Info')
            }
        }else{ // maybe it is a xref stream
            logger.debug('Maybe it is a xref stream... try to read it')
            return null
        }
    }

    parseXRefStreamByOffset(offset){
        this.stream.reset()
        this.stream.moveTo(offset)
    }

    readAllXRefTable(){

    }

    toJSON(){
        return {
            startXRef : this.startXRef.toJSON(),
            startTrailer : this.startTrailer.toJSON()
        }
    }
}
