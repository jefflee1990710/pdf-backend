import {FileReader} from './reader'
import {isSpace, isNumber} from './helper'
import config from 'config'

export class PDFDocument {

    loadFromFile(path){
        this.reader = new FileReader(path)
        this.bs = this.reader.getStream()
    }

    // loadFromWeb(url){
        
    // }

    get startXref(){
        let startXrefStr = "startxref"
        let found = this.bs.findBackward(startXrefStr, -1)
        if(found){
            this.bs.skip(startXrefStr.length - 1) // Point to one byte before, so prepare for reading.
            // Skip next comming space or linebreak
            let char = this.bs.peekByte()
            while(isSpace(char[0])){
                this.bs.skip(1)
                char = this.bs.peekByte()
            }

            let xrefoffset = ""
            char = this.bs.peekByte()
            while(isNumber(char[0])){
                xrefoffset += (char.toString(config.get('pdf.encoding')))
                this.bs.skip(1)
                char = this.bs.peekByte()
            }
            
            console.log(xrefoffset)

        }
        return found;
    }

}