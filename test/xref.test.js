
import "babel-polyfill"
import {expect} from 'chai'
import PDFDocument from "../src/object/pdf/PDFDocument";

describe('PDFXRef', () => {
    describe('#getMasterXRef', async () => {
        it('can get master xref table from a updated pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-2.pdf')
            let xref = await pdfDocument.getMasterXRef()
            expect(xref).is.not.null
            console.log(xref)
        })
    })
})