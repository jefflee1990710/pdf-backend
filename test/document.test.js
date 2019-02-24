import "babel-polyfill"
import assert from 'assert'
import config from 'config'

import {PDFDocument} from '../src/document'

describe('PDFDocument', () => {
   
    describe('#startXref', () =>{
        it('should return true for finding startxref', () => {
            let pdfDoc = new PDFDocument()
            pdfDoc.loadFromFile('./pdf-sample/sample.pdf')
            console.log(pdfDoc.startXref)
        })
    })

})