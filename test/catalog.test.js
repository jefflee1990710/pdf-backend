import "babel-polyfill"
import {expect} from 'chai'
import PDFDocument from "../src/object/pdf/PDFDocument";

describe('PDFCatalog', () => {
    
    describe('#toJSON', () => {
        it('retrieve catalog from incremental pdf', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/incremental-update-demo-2.pdf')
            expect(pdfDocument.catalog).is.not.null
            expect(pdfDocument.catalog.toJSON()).is.deep.eq({ 
                type: 'Catalog',
                pages: '2 0 R',
            })
        })
        it('retrieve catalog from linearized pdf', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/xref-stream-sample-1.pdf')
            expect(pdfDocument.catalog).is.not.null
            expect(pdfDocument.catalog.toJSON()).is.deep.eq({ 
                type: 'Catalog',
                pages: '5 0 R'
            })
        })
    })

    describe('#pages', () => {
        it('retrieve all pages from incremental pdf', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/incremental-update-demo-2.pdf')
            expect(pdfDocument.catalog).is.not.null
            expect(pdfDocument.catalog.pages.constructor.name).is.eq('PDFPages')
        })
    })

    describe('#getPages', () => {
        it('get pages object', async () => {
            let pdfDocument = new PDFDocument()
            pdfDocument.load('./pdf-sample/incremental-update-demo-2.pdf')
            expect(pdfDocument.catalog).is.not.null
            console.log(pdfDocument.catalog.toJSON())
            console.log(pdfDocument.catalog.pages.toJSON())
        })
    })
})