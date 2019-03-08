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

    describe('#readXref', () => {
        it('read xref-table by offset given', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let {xRef, trailer} = pdfDocument.parseXRefByOffset(startOffset)
            console.log(xRef.toJSON())

            console.log(trailer.toJSON())

        })
    })

    describe('#readTrailer', () => {

    })

    describe('#constructMasterXRefTable', () => {
        
    })
})