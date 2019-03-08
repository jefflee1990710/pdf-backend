import PDFAnd from '../condition/PDFAnd';
import PDFDict from '../PDFDict';
import PDFCmd from '../PDFCmd';
import PDFSpace from '../PDFSpace';

export default class PDFTrailer extends PDFAnd{

    constructor(config){
        super(config)
    }

    in(){
        return [
            new PDFCmd('trailer'),
            new PDFSpace(),
            new PDFDict({name : 'trailer'})
        ]
    }
}