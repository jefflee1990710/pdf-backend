import PDFIndirectObject from '../PDFIndirectObject'
import { InvalidPDFFormatError } from '../../error';
import PDFPages from './PDFPages'

export default class PDFCatalog extends PDFIndirectObject{

    constructor(config){
        super(config)
    }

    receiveElements(){}

    receiveElement(elem){
        if(elem.constructor.name !== "PDFDict"){
            throw new InvalidPDFFormatError(`Catalog object should be PDFDict, but ${elem.constructor.name} found`)
        }
        this.elem = elem
        if(this.elem.get('Pages') === null){
            throw new InvalidPDFFormatError('"Pages" field in PDFCatalog is required')
        }
        if(this.elem.get('Type') === null){
            throw new InvalidPDFFormatError('"Type" field in PDFCatalog is required')
        }
    }

    toJSON(deep){
        return {
            type : this.elem.get('Type').value,
            pages : deep ? this.pages.toJSON(deep) : this.elem.get('Pages').toJSON(deep)
        }
    }

    get pages(){
        let pagesVal = this.elem.get('Pages')
        const {getPDFObjectByOffset} = require('../../object/pdf/PDFDocument')
        if(pagesVal.constructor.name === 'PDFObjectReference'){
            let offsetObj = this.config.document.xRef.searchOffsetRecord(pagesVal.objectNumber.value, pagesVal.generationNumber.value)
            let pages;
            if(!offsetObj){
                throw new InvalidPDFFormatError(`Object "${pagesVal.toDisplayName()}"'s offset is not found in cross-reference table`)
            }
            if(offsetObj && offsetObj.constructor.name === 'UncompressedObjectOffsetRecord'){
                pages = getPDFObjectByOffset.apply(this.config.document, [offsetObj.offset, PDFPages])
            }else {
                // Compressed Object
                new Error('Compressed Object extract not implement yet')
            }
            return pages
        }else{
            throw new InvalidPDFFormatError(`Pages object should be PDFObjectReference, but ${pagesVal.constructor.name} found`)
        }
    }

}