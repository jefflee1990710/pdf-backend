import {FileReader} from './reader'


export class PDFDocument {

    loadFromFile(path){
        this.reader = new FileReader(path)
        this.bufferStream = this.reader.toStream()
    }


}