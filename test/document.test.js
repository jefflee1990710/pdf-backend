import "babel-polyfill"
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
        it('read xref-table by offset given', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await pdfDocument.parseXRefTableByOffset(startOffset)
            expect(xref.root.toDisplayName()).is.eq('1 0 R')
            expect(xref.prev).is.null
            expect(xref.info.toDisplayName()).is.eq('10 0 R')
        })
        it('read xref table with incremental-update', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref = await pdfDocument.parseXRefTableByOffset(startOffset)
            expect(xref.root.toDisplayName()).is.eq('1 0 R')
            expect(xref.prev.value).is.eq(599)
            expect(xref.info).is.null
        })
        it('return null for read xref stream', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await pdfDocument.parseXRefTableByOffset(startOffset)
            expect(xref).is.null
        })
    })

    describe('#getXRefOffsetByOffset', () => {
        it('should read xref offset by its offset', () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let offset = pdfDocument.getXRefOffsetByOffset(599)
            expect(offset).is.eq(425)
        })
    })

    describe('#parseXRefStreamByOffset', () => {
        it('can parse ref stream', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await pdfDocument.parseXRefStreamByOffset(startOffset)
            expect(xref.root.toDisplayName()).is.eq('8 0 R')
            expect(xref.prev.value).is.eq(7657)
            expect(xref.info.toDisplayName()).is.eq('6 0 R')
        })
    })

    describe('#parseObjectStreamByOffset', () => {
        it('can parse object stream', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let objectStream =  await pdfDocument.parseObjectStreamByOffset(776)
            expect(objectStream.dict).is.not.null
            expect(objectStream.dict.get('Filter').value).is.eq('FlateDecode')
            expect(objectStream.dict.get('Length').value).is.eq(773)
            expect(objectStream.buffer.length).is.eq(773)
        })
    })

    describe('#calculatedXRefTable', async () => {
        it('can get master xref table from a updated pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let xref = await pdfDocument.calculatedXRefTable()
            expect(xref.objectMap['6 0 R'].offset).is.eq(617)
        })
        it('can retrieve master xref from a xreft stream pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let xref = await pdfDocument.calculatedXRefTable()
            console.log(xref)
        })
    })

})