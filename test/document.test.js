import "babel-polyfill"
// import {PDFDocument} from '../src/document'
// import assert from 'assert'
// import {expect} from 'chai'

describe('PDFDocument', () => {
    describe('#startXRef', () => {
        // it('get xrefoffset 2714 from sample.pdf', () => {
        //     let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
        //     assert.equal(pdfDocument.startXRefOffset, 2714)
        // })
        // it('get xrefoffset 116 from sample-xrefstm.pdf', () => {
        //     let pdfDocument = new PDFDocument('./pdf-sample/sample-xrefstm.pdf')
        //     assert.equal(pdfDocument.startXRefOffset, 116)
        // })
        // it('throw exception if startxref not found', () => {
        //     expect(() => {
        //         let pdfDocument = new PDFDocument()
        //         pdfDocument.loadFromFile('./pdf-sample/not-pdf-file.png')
        //     }).to.throw()
        // })
        // it('throw exception if a pdf with invalid first xref offset', () => {
        //     expect(() => {
        //         let pdfDocument = new PDFDocument()
        //         pdfDocument.loadFromFile('./pdf-sample/pdf-invalid-offset.pdf')
        //     }).to.throw()
        // })
    })

    describe('#readXref', () => {
        // it('read xref-table by offset given', () => {
        //     let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
        //     let xref = pdfDocument.readXref(2714)
            
        //     console.log(xref)
        // })
    })

    describe('#readTrailer', () => {

    })

    describe('#constructMasterXRefTable', () => {
        
    })
})