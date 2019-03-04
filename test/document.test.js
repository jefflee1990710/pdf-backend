import "babel-polyfill"
import {PDFDocument} from '../src/document'
import assert from 'assert'
import {expect} from 'chai'

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
        it('cant find a xref', () => {
            expect(() => {
                let pdfDocument = new PDFDocument()
                pdfDocument.loadFromFile('./pdf-sample/not-pdf-file.png')
            }).to.throw()
        })
        it('read a pdf with invalid first xref offset', () => {
            expect(() => {
                let pdfDocument = new PDFDocument()
                pdfDocument.loadFromFile('./pdf-sample/pdf-invalid-offset.pdf')
            }).to.throw()
        })
    })

    describe('#readXref', () => {
        it('read xref-table by offset given', () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.loadFromFile('./pdf-sample/sample.pdf')
            let startXref = pdfDocument.startXRef

        })
    })
})