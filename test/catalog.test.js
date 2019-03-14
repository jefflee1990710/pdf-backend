import "babel-polyfill"
import {expect} from 'chai'
import PDFDocument from "../src/object/pdf/PDFDocument";

describe('PDFCatalog', () => {
    
    describe('#catalog', () => {
        it('retrieve catalog from incremental pdf', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/incremental-update-demo-2.pdf')
            expect(pdfDocument.catalog).is.not.null
            console.log(pdfDocument.catalog)
        })
        it('retrieve catalog from linearized pdf', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/xref-stream-sample-1.pdf')
            expect(pdfDocument.catalog).is.not.null
            console.log(pdfDocument.catalog)
        })
    })

})