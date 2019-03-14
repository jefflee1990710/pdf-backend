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
        const {parseXRefTableByOffset} = require('../src/object/pdf/PDFDocument')

        it('read xref-table by offset given', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/sample.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await parseXRefTableByOffset(pdfDocument.stream, startOffset)
            expect(xref.root.toDisplayName()).is.eq('1 0 R')
            expect(xref.prev).is.null
            expect(xref.info.toDisplayName()).is.eq('10 0 R')
        })
        it('read xref table with incremental-update', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref = await parseXRefTableByOffset(pdfDocument.stream, startOffset)
            expect(xref.root.toDisplayName()).is.eq('1 0 R')
            expect(xref.prev.value).is.eq(599)
            expect(xref.info).is.null
        })
        it('return null for read xref stream', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await parseXRefTableByOffset(pdfDocument.stream, startOffset)
            expect(xref).is.null
        })
    })

    describe('#getXRefOffsetByOffset', () => {
        it('should read xref offset by its offset', () => {
            const {getXRefOffsetByOffset} = require('../src/object/pdf/PDFDocument')
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let offset = getXRefOffsetByOffset(pdfDocument.stream, 599)
            expect(offset).is.eq(425)
        })
    })

    describe('#parseXRefStreamByOffset', () => {
        it('can parse ref stream', async () => {
            const {parseXRefStreamByOffset} = require('../src/object/pdf/PDFDocument')
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let startOffset = pdfDocument.startXRefOffset
            let xref =  await parseXRefStreamByOffset(pdfDocument.stream, startOffset)
            expect(xref.root.toDisplayName()).is.eq('8 0 R')
            expect(xref.prev.value).is.eq(7657)
            expect(xref.info.toDisplayName()).is.eq('6 0 R')
        })
    })

    describe('#parseObjectStreamByOffset', () => {
        it('can parse object stream', async () => {
            const {parseObjectStreamByOffset} = require('../src/object/pdf/PDFDocument')
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let objectStream =  await parseObjectStreamByOffset(pdfDocument.stream, 776)
            expect(objectStream.dict).is.not.null
            expect(objectStream.dict.get('Filter').value).is.eq('FlateDecode')
            expect(objectStream.dict.get('Length').value).is.eq(773)
            expect(objectStream.buffer.length).is.eq(773)
        })
    })

    describe('#getMasterXRef', async () => {
        it('can get master xref table from a updated pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let xref = await pdfDocument.getMasterXRef()
            expect(xref.root.toDisplayName()).is.eq('1 0 R')
            expect(xref.objectTable.length).is.eq(6)
            
        })
        it('can retrieve master xref from a xreft stream pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/xref-stream-sample-1.pdf')
            let xref = await pdfDocument.getMasterXRef()
            expect(xref.root.toDisplayName()).is.eq('8 0 R')
            expect(xref.objectTable.length).is.eq(21)
        })
    })

    describe('#getAllXRef', () => {
        it('retrieve all xref in incremental pdf', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-1.pdf')
            let allXRef = await pdfDocument.getAllXRef()
            expect(allXRef.length).is.eq(2)
        })
        it('retrieve all xref in incremental pdf with new object', async () => {
            let pdfDocument = new PDFDocument('./pdf-sample/incremental-update-demo-2.pdf')
            let allXRef = await pdfDocument.getAllXRef()
            expect(allXRef.length).is.eq(3)        
        })
    })

})