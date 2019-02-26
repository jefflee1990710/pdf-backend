import {FileReader} from './reader'
import helper from './helper'
import {
    InvalidPDFFormatError
} from './error'
import config from 'config'

export class PDFDocument {

    loadFromFile(path){
        this.reader = new FileReader(path)
        this.bs = this.reader.getStream()
    }

    // loadFromWeb(url){
        
    // }

    get startXRef(){
        let startXrefStr = "startxref"
        let found = this.bs.findBackward(startXrefStr, -1)
        if(found){
            this.bs.skip(startXrefStr.length - 1) // Point to one byte before, so prepare for reading.
            // Skip next comming space or linebreak
            let char = this.bs.peekByte()
            while(helper.isSpace(char[0])){
                this.bs.skip(1)
                char = this.bs.peekByte()
            }

            let xrefoffset = ""
            char = this.bs.peekByte()
            while(helper.isNumber(char[0])){
                xrefoffset += (char.toString(config.get('pdf.encoding')))
                this.bs.skip(1)
                char = this.bs.peekByte()
            }
            
            try{
                xrefoffset = parseInt(xrefoffset, 10)
                return helper.readonly(this, "startXRef", xrefoffset);
            }catch(e){
                throw new InvalidPDFFormatError(`Invalid PDF Format - Error when parsing xRef offset. "${xrefoffset}" is found in the PDF.`)
            }
        }else{
            throw new InvalidPDFFormatError('Invalid PDF Format - Keyword "startxref" not found in the PDF file.')
        }
    }

}