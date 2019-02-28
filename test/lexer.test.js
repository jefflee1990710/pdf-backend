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
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(true);
        })
        it('can read true from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from('truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(true);
        })
        it('can read false from stream', () => {
            let reader = new ByteArrayReader(Buffer.from('false', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
        })
        it('can read false from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from('falsesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
        })
    })

    describe('#getCmd', () => {
        it('can read cmd as string', () => {
            let reader = new ByteArrayReader(Buffer.from('<<dict start>>', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "<<")
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFCmd')
            expect(val).equal("<<");
        })
        it('can read cmd as string with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from('truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "true")
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFCmd')
            expect(val).equal("true");
        })
    })

    describe('#getReal', () => {
        it('can read PostScript script for number (real and integer)', () => {
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

    describe('#getliteralString', () => {
        it('can read single parenthsis string', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string");
        })
        it('can read string contain new line', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string \n with new line)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string \n with new line");
        })
        it('can read string with balanced parentheses', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string (with balanced parentheses) no problem)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string (with balanced parentheses) no problem");
        })
        it('can read string with 0 length', () => {
            let reader = new ByteArrayReader(Buffer.from("()", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("");
        })
    })

    describe('#getHexadecimalString()', () => {
        it('can read paired hexdecimal string', () => {
            let reader = new ByteArrayReader(Buffer.from("<A3F234C4DEA0>", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
        })
        it('can read hexdecimal string missing last zero', () => {
            let reader = new ByteArrayReader(Buffer.from("<A3F234C4DEA>", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
        })
    })

    describe('#getName()', () => {
        
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
                expect(pdfobj.constructor.name).equal('PDFReal')
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
        it('can read true from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from('truesuffix', pdfEncoding))
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
        it('can read false from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from('falsesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getObj()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
        })
        it('can read PostScript script for number (real and integer)', () => {
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
        it('can read single parenthsis string', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getObj()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string");
        })
        it('can read string contain new line', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string \n with new line)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getObj()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string \n with new line");
        })
        it('can read string with balanced parentheses', () => {
            let reader = new ByteArrayReader(Buffer.from("(This is a string (with balanced parentheses) no problem)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getObj()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string (with balanced parentheses) no problem");
        })
        it('can read string with 0 length', () => {
            let reader = new ByteArrayReader(Buffer.from("()", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getObj()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("");
        })
        it('can read paired hexdecimal string', () => {
            let reader = new ByteArrayReader(Buffer.from("<A3F234C4DEA0>", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
        })
        it('can read hexdecimal string missing last zero', () => {
            let reader = new ByteArrayReader(Buffer.from("<A3F234C4DEA>", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
        })
    })


})