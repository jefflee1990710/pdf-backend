import {FileReader} from '../../reader'
import {InvalidPDFFormatError} from '../../error'
import logger from '../../logger'
import PDFXRefTable from './PDFXrefTable';
import PDFReal from '../PDFReal';
import PDFAnd from '../condition/PDFAnd';
import PDFCmd from '../PDFCmd';
import PDFSpace from '../PDFSpace';

export default class PDFDocument {

    constructor(path){
        this.reader = new FileReader(path)
        this.stream = this.reader.toStream()

        // this.startXRef = new PDFXRefTable()
    }

    load(){
        try{
            let xref = this.readXref(this.startXRefOffset)
            console.log(xref)
        }catch(e){
            logger.error(e)
            throw new InvalidPDFFormatError()
        }
    }

    get isLinearization(){

        return false
    }

    get startXRefOffset(){
        let startXrefStr = 'startxref'

        if(this.isLinearization){
            // Do something if pdf is Linearization
        }else{
            this.stream.reset()
            let found = this.stream.findBackward(startXrefStr, -1)
            if(found){
                this.stream.getBytes(startXrefStr.length)
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

}