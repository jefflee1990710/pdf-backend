import "babel-polyfill"
import assert from 'assert'
import BufferStream from '../src/buffer-stream'
import {ByteArrayReader} from '../src/reader'
import Lexer from "../src/lexer";
import config from 'config'
import {expect} from 'chai'

let pdfEncoding = config.get('pdf.encoding')

describe('Lexer', () => {
    describe('#nextChar()', () => {
        it('read the first byte from stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            assert.equal(lexer.nextChar(), 0x01)
            assert.equal(stream.position, 1)
        })
        it('read the first 2 bytes from stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            assert.equal(lexer.nextChar(), 0x01)
            assert.equal(lexer.nextChar(), 0x02)
            assert.equal(stream.position, 2)
        })
        it('return null if it read the end', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02]))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            assert.equal(lexer.nextChar(), 0x01)
            assert.equal(lexer.nextChar(), 0x02)
            assert.equal(lexer.nextChar(), null)
        })
    })

    describe('#peekChar', () => {
        it('peek first byte from stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            assert.equal(lexer.peekChar(), 0x01)
            assert.equal(stream.position, 0)
        })
    })

    describe('#getBoolean', () => {
        it('can read true from stream', () => {
            let reader = new ByteArrayReader(Buffer.from('true', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getBoolean()
            expect(val).equal(true);
        })
        it('can read false from stream', () => {
            let reader = new ByteArrayReader(Buffer.from('false', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getBoolean()
            expect(val).equal(false);
        })
    })

    describe('#getInteger', () => {
        it('can read PostScript syntax for integer', () => {
            let numbers = ['123', '43445', '+17', '-98', '0'];
            for (var i = 0; i < numbers.length; i++) {
                let num = numbers[i];
                let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                let stream = new BufferStream(reader)
                let lexer = new Lexer(stream)
                let {val} = lexer.getInteger()
                expect(val).equal(parseInt(num));
            }
        })
    })

    describe('#getReal', () => {
        it('can read PostScript script for real', () => {
            let numbers = ['34.5', '-3.62', '+123.4', '4.0', '-.002', '0.0', '123', '43445', '+17', '-98', '0'];
            for (var i = 0; i < numbers.length; i++) {
                let num = numbers[i];
                let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                let stream = new BufferStream(reader)
                let lexer = new Lexer(stream)
                let {val} = lexer.getReal()
                expect(val).equal(parseFloat(num));
            }
        })
    })

    describe('#getObj', () => {
        it('can read PostScript syntax for integer or boolean', () => {
            let numbers = ['123', '43445', '+17', '-98', '0'];
            for (var i = 0; i < numbers.length; i++) {
                let num = numbers[i];
                let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                let stream = new BufferStream(reader)
                let lexer = new Lexer(stream)
                let pdfobj = lexer.getObj()
                let {val} = pdfobj
                expect(pdfobj.constructor.name).equal('PDFInteger')
                expect(val).equal(parseInt(num));
            }
        })
        it('can read true from stream', () => {
            let reader = new ByteArrayReader(Buffer.from('true', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getObj()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(true);
        })
        it('can read false from stream', () => {
            let reader = new ByteArrayReader(Buffer.from('false', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getObj()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
        })
        it('can read PostScript script for real', () => {
            let numbers = ['34.5', '-3.62', '+123.4', '4.0', '-.002', '0.0', '123', '43445', '+17', '-98', '0'];
            for (var i = 0; i < numbers.length; i++) {
                let num = numbers[i];
                let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                let stream = new BufferStream(reader)
                let lexer = new Lexer(stream)
                let {val} = lexer.getObj()
                expect(val).equal(parseFloat(num));
            }
        })
    })

})