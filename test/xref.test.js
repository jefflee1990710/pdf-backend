
import "babel-polyfill"
import {expect} from 'chai'
import PDFDocument from "../src/object/pdf/PDFDocument";

describe('PDFXRef', () => {
    describe('#rootObjectOffset', async () => {
        const {getMasterXRef} = require('../src/object/pdf/PDFDocument')
        it('can correct retrieve a root object offset of a incremental updated pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-2.pdf')
            let xref = getMasterXRef.apply(pdfDocument)
            expect(xref).is.not.null
            expect(xref.rootObjectOffset.offset).is.eq(9)
        })
        it('can correct retrieve a root object offset of a linearized pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let xref = getMasterXRef.apply(pdfDocument)
            expect(xref).is.not.null
            expect(xref.rootObjectOffset.offset).is.eq(588)
        })
    })
})