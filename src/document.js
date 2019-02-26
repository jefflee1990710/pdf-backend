import {FileReader} from './reader'
import helper from './helper'
import {
    InvalidPDFFormatError
} from './error'
import Lexer from './lexer';
import { Integer } from './object';

export class PDFDocument {

    loadFromFile(path){
        this.reader = new FileReader(path)
        this.bufferStream = this.reader.toStream()
    }

    get startXRef(){
        let startXrefStr = "startxref"
        let found = this.bufferStream.findBackward(startXrefStr, -1)
        if(found){
            this.bufferStream.skip(startXrefStr.length) // Point to one byte before, so prepare for reading.
            // Skip next comming space or linebreak

            let lexer = new Lexer(this.bufferStream) // Create a Lexer for streambuffer parsing
            let integerObj = lexer.parse(Integer) // Should be pointing at xref offset after find. So lexer will parse coming byte as integer.
            if(!integerObj){ // If the coming byte can't parse as Integer, maybe PDF file is invalid. <- the offset value is not after "startxref"
                throw new InvalidPDFFormatError(`Invalid PDF Format - Error when trying to parse expected xrefoffset in PDF file`)
            }
            let xrefoffset = integerObj.value
            return helper.readonly(this, "startXRef", xrefoffset);
        }else{
            throw new InvalidPDFFormatError('Invalid PDF Format - Keyword "startxref" not found in the PDF file.')
        }
    }

    
}