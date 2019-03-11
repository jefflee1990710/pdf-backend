import "babel-polyfill"
// import assert from 'assert'
import {expect} from 'chai'
import PDFDocument from "../src/object/pdf/PDFDocument";

describe('PDFDocument', () => {
    describe('#startXRef', () => {
        it('get xrefoffset 2714 from sample.pdf', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
            expect(pdfDocument.startXRefOffset).is.eq(2714)
        })
        it('get xrefoffset 116 from sample-xrefstm.pdf', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample-xrefstm.pdf')
            expect(pdfDocument.startXRefOffset).is.eq(116)
        })
        it('throw exception if startxref not found', () => {
            expect(() => {
                let pdfDocument = new PDFDocument()
                pdfDocument.loadFromFile('./pdf-sample/not-pdf-file.png')
            }).to.throw()
        })
        it('throw exception if a pdf with invalid first xref offset', () => {
            expect(() => {
                let pdfDocument = new PDFDocument()
                pdfDocument.loadFromFile('./pdf-sample/pdf-invalid-offset.pdf')
            }).to.throw()
        })
    })

    describe('#parseXRefTableByOffset', () => {
        it('read xref-table by offset given', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let trailer = pdfDocument.parseXRefTableByOffset(startOffset)
            console.log(trailer)
        })
        it('read xref table with incremental-update', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let trailer = pdfDocument.parseXRefTableByOffset(startOffset)
            // console.log(trailer)
        })
        it('return null for read xref stream', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let trailer = pdfDocument.parseXRefTableByOffset(startOffset)
            // console.log(trailer)
        })
    })

    describe('#readTrailer', () => {

    })

    describe('#constructMasterXRefTable', () => {
        
    })
})