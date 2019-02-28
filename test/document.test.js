import "babel-polyfill"
import {PDFDocument} from '../src/document'
import assert from 'assert'

describe('PDFDocument', () => {
    describe('#startXRef', () => {
        it('get xrefoffset 2714 from sample.pdf', () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.loadFromFile('./pdf-sample/sample.pdf')
            assert.equal(pdfDocument.startXRef, 2714)
        })
        it('get xrefoffset 116 from sample-xrefstm.pdf', () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.loadFromFile('./pdf-sample/sample-xrefstm.pdf')
            assert.equal(pdfDocument.startXRef, 116)
        })
    })
})