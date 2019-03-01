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
        it('should return null for command not found', () => {
            let reader = new ByteArrayReader(Buffer.from('truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "(")
            expect(pdfobj).equal(null);
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

        it('should return null for non number object', () => {
            let numbers = ['(123)', 'abc', '!@#'];
            for (var i = 0; i < numbers.length; i++) {
                let num = numbers[i];
                let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                let stream = new BufferStream(reader)
                let lexer = new Lexer(stream)
                let pdfobj = lexer.getReal()
                expect(pdfobj).equal(null);
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
        it('read a simple name', () => {
            let reader = new ByteArrayReader(Buffer.from("/Name1", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("Name1");
        })
        it('read a longer name', () => {
            let reader = new ByteArrayReader(Buffer.from("/ThisIsAMuchLongerName", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("ThisIsAMuchLongerName");
        })
        it('read a name with various character', () => {
            let reader = new ByteArrayReader(Buffer.from("/A;Name_With-Various***Characters?", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("A;Name_With-Various***Characters?");
        })
        it('read a name with number', () => {
            let reader = new ByteArrayReader(Buffer.from("/1.2", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("1.2");
        })
        it('read a name with dollor sign', () => {
            let reader = new ByteArrayReader(Buffer.from("/$$", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("$$");
        })
        it('read a name with @', () => {
            let reader = new ByteArrayReader(Buffer.from("/@pattern", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("@pattern");
        })
        it('read a name start with dot', () => {
            let reader = new ByteArrayReader(Buffer.from("/.notdef", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal(".notdef");
        })
        it('read a name with number sign', () => {
            let reader = new ByteArrayReader(Buffer.from("/lime#20green", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("lime green");
        })
        it('read a name with parentheses', () => {
            let reader = new ByteArrayReader(Buffer.from("/lime#28#29green", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("lime()green");
        })
        it('read a name with #', () => {
            let reader = new ByteArrayReader(Buffer.from("/lime#23green", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("lime#green");
        })
        it('read a name which normal character is number sign', () => {
            let reader = new ByteArrayReader(Buffer.from("/A#42", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("AB");
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
        it('should ignore escaped CR and LF', () => {
            let reader = new ByteArrayReader(Buffer.from("(\\101\\\r\n\\102\\\r\\103\\\n\\104)", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getObj()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("ABCD");
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