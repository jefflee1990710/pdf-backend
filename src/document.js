import {FileReader} from './reader'
import {InvalidPDFFormatError} from './error'
import Lexer from './lexer'
import logger from './logger';

export class PDFDocument {

    loadFromFile(path){
        this.reader = new FileReader(path)
        this.bufferStream = this.reader.toStream()
        this.load()
    }

    load(){
        try{
            let startXRef = this.startXRef
        }catch(e){
            logger.error(e)
            throw new InvalidPDFFormatError()
        }
    }

    get startXRef(){
        let startXrefStr = 'startxref'
        let found = this.bufferStream.findBackward(startXrefStr, -1)
        if(found){
            this.bufferStream.skip(startXrefStr.length)
            let lexer = new Lexer(this.bufferStream)
            let startxrefoffset = lexer.getReal()
            if(startxrefoffset){
                return startxrefoffset.val
            }else{
                throw new InvalidPDFFormatError(`Invalid PDF Format - Error when trying to parse expected xrefoffset in PDF file`)
            }
        }else{
            throw new InvalidPDFFormatError('Invalid PDF Format - Keyword "startxref" not found in the PDF file.')
        }
    }

    readXref(offset){

    }

}