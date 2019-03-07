import {FileReader} from './reader'
import {InvalidPDFFormatError} from './error'
import Lexer from './lexer'
import logger from './logger';

export class PDFDocument {

    constructor(path){
        this.reader = new FileReader(path)
        this.stream = this.reader.toStream()
        this.lexer = new Lexer(this.stream)
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

    get startXRefOffset(){
        let startXrefStr = 'startxref'
        let found = this.stream.findBackward(startXrefStr, -1)
        if(found){
            this.stream.skip(startXrefStr.length)
            let startxrefoffset = this.lexer.getReal()
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
        this.stream.moveTo(offset)
        let xrefTable = this.lexer.getXRefTable()
        return xrefTable
    }

    // readTrailer(offset){
        
    // }

    /**
     * Construct object number to offset map, able to lazy retrieve object without loading whole file to ram
     */
    constructMasterXRefTable(){

    }

}