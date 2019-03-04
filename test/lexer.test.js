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

    describe('#getSpace', () => {
        it('can read multiple space', () => {
            let reader = new ByteArrayReader(Buffer.from(' somethingbehind', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getSpace()
            expect(pdfobj.constructor.name).equal('PDFSpace')
            expect(stream.position).equal(1)
        })
    })

    describe('#getLineBreak', () => {
        it('can read \\r\\n', () => {
            let reader = new ByteArrayReader(Buffer.from('\r\n', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getLineBreak()
            expect(pdfobj.constructor.name).equal('PDFLineBreak')
            expect(stream.position).equal(2)
        })
        it('can read \\r', () => {
            let reader = new ByteArrayReader(Buffer.from('\r', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getLineBreak()
            expect(pdfobj.constructor.name).equal('PDFLineBreak')
            expect(stream.position).equal(1)
        })
        it('can read \\n', () => {
            let reader = new ByteArrayReader(Buffer.from('\n', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getLineBreak()
            expect(pdfobj.constructor.name).equal('PDFLineBreak')
            expect(stream.position).equal(1)
        })
    })

    describe("#getNull", () => {
        it('can read null by keyword', () => {
            let reader = new ByteArrayReader(Buffer.from(' null ', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getNull()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFNull')
            expect(val).equal(null);
            expect(stream.position).equal(5)
        })
    })

    describe('#getBoolean', () => {
        it('can read true from stream', () => {
            let reader = new ByteArrayReader(Buffer.from(' true', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(true);
            expect(stream.position).equal(5)
        })
        it('can read true from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from(' truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(true);
            expect(stream.position).equal(5)
        })
        it('can read false from stream', () => {
            let reader = new ByteArrayReader(Buffer.from(' false', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
            expect(stream.position).equal(6)
        })
        it('can read false from stream with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from(' falsesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getBoolean()
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFBoolean')
            expect(val).equal(false);
            expect(stream.position).equal(6)
        })
    })

    describe('#getCmd', () => {
        it('can read cmd as string', () => {
            let reader = new ByteArrayReader(Buffer.from(' <<dict start>>', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "<<")
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFCmd')
            expect(val).equal("<<");
            expect(stream.position).equal(3)
        })
        it('can read cmd as string with suffix', () => {
            let reader = new ByteArrayReader(Buffer.from(' truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "true")
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFCmd')
            expect(val).equal("true");
            expect(stream.position).equal(5)
        })
        it('can read cmd at the end of the stream', () => {
            let reader = new ByteArrayReader(Buffer.from(' <<', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "<<")
            let {val} = pdfobj
            expect(pdfobj.constructor.name).equal('PDFCmd')
            expect(val).equal("<<");
            expect(stream.position).equal(3)
        })
        it('should return null for command not found', () => {
            let reader = new ByteArrayReader(Buffer.from(' truesuffix', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfobj = lexer.getCmd(null, "(")
            expect(pdfobj).equal(null);
            expect(stream.position).equal(0)
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
                expect(stream.position, "Finally position is not correct for " + num).equal(num.length)
            }
        })

        it('should consume the stream to right position', () => {
            let reader = new ByteArrayReader(Buffer.from(' 34.5 ', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getReal()
            expect(val).equal(parseFloat(34.5));
            expect(stream.position).equal(5)
        })

        it('should consume the stream to right position after the input', () => {
            let reader = new ByteArrayReader(Buffer.from(' 34.5', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getReal()
            expect(val).equal(parseFloat(34.5));
            expect(stream.position).equal(5)
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

    describe('#getOctal', () => {
        it('can read octal with two digital', () => {
            let reader = new ByteArrayReader(Buffer.from(' \\51', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getOctal()
            expect(val).equal(')');
            expect(stream.position).equal(4)
        })
        it('can read octal with three digital', () => {
            let reader = new ByteArrayReader(Buffer.from('\\101', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getOctal()
            expect(val).equal('A');
            expect(stream.position).equal(4)
        })
    })

    describe('#getLiteralString', () => {
        it('can read single parenthsis string', () => {
            let reader = new ByteArrayReader(Buffer.from(" (This is a string) ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string");
            expect(stream.position).equal(19)
        })
        it('can read string contain new line', () => {
            let reader = new ByteArrayReader(Buffer.from(" (This is a string \n with new line) ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string \n with new line");
            expect(stream.position).equal(35)
        })
        it('can read string with balanced parentheses', () => {
            let reader = new ByteArrayReader(Buffer.from(" (This is a string (with balanced parentheses) no problem) ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("This is a string (with balanced parentheses) no problem");
            expect(stream.position).equal(58)
        })
        it('can read string with 0 length', () => {
            let reader = new ByteArrayReader(Buffer.from(" () ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getLiteralString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFLiteralString")
            expect(val).equal("");
            expect(stream.position).equal(3)
        })
    })

    describe('#getHexadecimalString()', () => {
        it('can read paired hexdecimal string', () => {
            let reader = new ByteArrayReader(Buffer.from(" <A3F234C4DEA0> ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
            expect(stream.position).equal(15)
        })
        it('can read hexdecimal string missing last zero', () => {
            let reader = new ByteArrayReader(Buffer.from(" <A3F234C4DEA> ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getHexadecimalString()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFHexadecimalString")
            expect(val).equal("A3F234C4DEA0");
            expect(stream.position).equal(14)
        })
    })

    describe('#getName()', () => {
        it('read a simple name', () => {
            let reader = new ByteArrayReader(Buffer.from(" /Name1 ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("Name1");
            expect(stream.position).equal(7)
        })
        it('read a longer name', () => {
            let reader = new ByteArrayReader(Buffer.from(" /ThisIsAMuchLongerName ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getName()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFName")
            expect(val).equal("ThisIsAMuchLongerName");
            expect(stream.position).equal(23)
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

    describe('#getArrayElement', () => {
        it('should read any array elements', () => {
            let reader = new ByteArrayReader(Buffer.from("12", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArrayElement()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFReal")
            expect(val).equal(12)
            expect(stream.position).equal(2);
        })
    })

    describe('#getArray', () => {
        it('can read a simple integer array', () => {
            let reader = new ByteArrayReader(Buffer.from("[1 2 3 4]", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal(1)
            expect(val[1].val).equal(2)
            expect(val[2].val).equal(3)
            expect(val[3].val).equal(4)
        })
        it('have a linebreak in the middle of the array', () => {
            let reader = new ByteArrayReader(Buffer.from("[1 2\n 3\r\n 4]", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal(1)
            expect(val[1].val).equal(2)
            expect(val[2].val).equal(3)
            expect(val[3].val).equal(4)
        })
        it('can read a simple real number array', () => {
            let reader = new ByteArrayReader(Buffer.from(" [3.5 -33.2 12 -.32] ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal(3.5)
            expect(val[1].val).equal(-33.2)
            expect(val[2].val).equal(12)
            expect(val[3].val).equal(-0.32)
            expect(stream.position).equal(20)
        })
        it('can read a sarray with mixed object', () => {
            let reader = new ByteArrayReader(Buffer.from("[3.5 /Name1 (I am a String) <A3F234C4DEA0> [12 13 14]]", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal(3.5)
            expect(val[1].val).equal("Name1")
            expect(val[2].val).equal("I am a String")
            expect(val[3].val).equal("A3F234C4DEA0")
            expect(val[4].constructor.name).equal("PDFArray")
            expect(stream.position).equal(54)
        })
        it('can read a array with linebreak', () => {
            let reader = new ByteArrayReader(Buffer.from("[3.5 \n\r /Name1 \n\n(I am a String) ]", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal(3.5)
            expect(val[1].val).equal("Name1")
            expect(val[2].val).equal("I am a String")
            expect(stream.position).equal(34)
        })
        it('can read a empty array', () => {
            let reader = new ByteArrayReader(Buffer.from(" [ ] ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val.length).equal(0)
            expect(stream.position).equal(4)
        })
        it('can read array with name', () => {
            let reader = new ByteArrayReader(Buffer.from(" [/Name1 /Name2 /Name3] ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getArray()
            let {val} = pdfObj
            expect(pdfObj.constructor.name).equal("PDFArray")
            expect(val[0].val).equal('Name1')
            expect(val[1].val).equal("Name2")
            expect(val[2].val).equal("Name3")
            expect(val.length).equal(3)
            expect(stream.position).equal(23)
        })
    })

    describe('#getDictEntry()', () => {
        it('can read a simple entry', () => {
            let reader = new ByteArrayReader(Buffer.from("/Type /Example", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDictEntry()
            let {val} = pdfObj
            expect(val.fieldname.val).equal("Type")
            expect(val.value.val).equal("Example")
            expect(stream.position).equal(13)
        })
        it('can read a simple entry with number', () => {
            let reader = new ByteArrayReader(Buffer.from("/Version 0.01", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDictEntry()
            let {val} = pdfObj
            expect(val.fieldname.val).equal("Version")
            expect(val.value.val).equal(0.01)
            expect(stream.position).equal(13)
        })
        it('can read a simple name entry without space', () => {
            let reader = new ByteArrayReader(Buffer.from("/Type/Example", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDictEntry()
            let {val} = pdfObj
            expect(val.fieldname.val).equal("Type")
            expect(val.value.val).equal("Example")
            expect(stream.position).equal(12)
        })
    })

    describe('#getDict()', () => {
        it('can read a simple dictionary', () => {
            let strbuf = [
                "<< /Type /Example",
                "/Version 0.01 >>"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDict()
            let json = pdfObj.toJson()
            expect(json['Type']).equal('Example')
            expect(json['Version']).equal(0.01)
        })
        it('can read dictionary with a sub dictionary', () => {
            let strbuf = [
                "<< /Type /Example",
                "/Version 0.01 /Subdictionary <</Item 0.4>> >>"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDict()
            let json = pdfObj.toJson()
            expect(json['Type']).equal('Example')
        })
        it('can read dictionary with array', () => {
            let strbuf = [
                "<< /Type /Example",
                "/Version 0.01 /Array [1 2 3 (String here)] >>"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDict()
            let json = pdfObj.toJson()
            expect(json['Type']).equal('Example')
        })
        it('can read dictionary without space', () => {
            let strbuf = [
                "<</Type/Example/Subtype/Button>>"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDict()
            let json = pdfObj.toJson()
            expect(json['Type']).equal('Example')
        })
        it('can read dictionary with a sub dictionary', () => {
            let strbuf = [
                "<< /Type /Example",
                "/Version 0.01 /Subdictionary <</Item 0.4 /Subitem <</Integer 1/String (Ok here)>>>>>>"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getDict()
            let json = pdfObj.toJson()
            expect(json['Type']).equal('Example')
        })
    })

    describe('#getStream', () => {
        it('can read sample stream', () => {
            let strbuf = [
                "stream",
                Buffer.from([0x01, 0x02, 0x03, 0x04]).toString(config.get('pdf.encoding')),
                "endstream"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getStream()
            expect(val).to.deep.eq(Buffer.from([0x01, 0x02, 0x03, 0x04]))
        })
        it('can read empty stream', () => {
            let strbuf = [
                "stream",
                Buffer.from([]).toString(config.get('pdf.encoding')),
                "endstream"
            ]
            let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getStream()
            expect(val).to.deep.eq( Buffer.from([]))
        })
    })

    describe('#getXRefSectionHeader', () => {
        it('can read simple xref table section header', () => {
            let reader = new ByteArrayReader(Buffer.from(" 28 5 ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getXRefSectionHeader()
            expect(val.firstObjectNum).eq(28)
            expect(val.objectCnt).eq(5)
        })
        it('return null for invalid header', () => {
            let reader = new ByteArrayReader(Buffer.from(" 28 a ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getXRefSectionHeader()
            expect(pdfObj).is.eq(null)
        })
    })

    describe('#getXRefSectionEntry', () => {
        it('can read simple entry in xref table (free entry)', () => {
            let reader = new ByteArrayReader(Buffer.from(" 0000000000 65535 f ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getXRefSectionEntry()
            expect(val.offset).is.eq(0)
            expect(val.generationNumber).is.eq(65535)
            expect(val.flag).is.eq('f')
        })
        it('can read simple entry in xref table', () => {
            let reader = new ByteArrayReader(Buffer.from(" 0000000147 00000 n ", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getXRefSectionEntry()
            expect(val.offset).is.eq(147)
            expect(val.generationNumber).is.eq(0)
            expect(val.flag).is.eq('n')
        })
        it('return null for invalid entry', () => {
            let reader = new ByteArrayReader(Buffer.from(" 0000000147", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getXRefSectionEntry()
            expect(pdfObj).is.eq(null)
        })
        it('return null if read entry from header', () => {
            let reader = new ByteArrayReader(Buffer.from("0 6", pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getXRefSectionEntry()
            expect(pdfObj).is.eq(null)
        })
    })

    describe('#getXRefTable', () => {
        it('can retrieve xref table with multi section', () => {
            let xrefbuffer = [
                "0 6",
                "0000000000 65535 f",
                "0000000019 00000 n",
                "0000000093 00000 n",
                "0000000147 00000 n",
                "0000000222 00000 n",
                "0000000390 00000 n",
                "6 3",
                "0000000450 00000 n",
                "0000000882 00000 n",
                "0000000938 00000 n"
            ]
            let reader = new ByteArrayReader(Buffer.from(xrefbuffer.join('\n'), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let {val} = lexer.getXRefTable()
            expect(val.sections.length).is.eq(2)
            expect(val.sections[0].entries.length).is.eq(6)
            expect(val.sections[1].entries.length).is.eq(3)
            expect(val.sections[0].entries[1].offset).is.eq(19)
            expect(val.sections[1].entries[1].offset).is.eq(882)
        })
        it('return null for unknow stream', () => {
            let reader = new ByteArrayReader(Buffer.from('random string not xref', pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getXRefTable()
            expect(pdfObj).is.null
        })
    })

    describe('#getIndirectObject', () => {
        it('read normal dictionary object', () => {
            let buffer = [
                "1 0 obj",
                "<< /Type /Catalog /Count 2 >>",
                "endobj"
            ]
            let reader = new ByteArrayReader(Buffer.from(buffer.join('\n'), pdfEncoding))
            let stream = new BufferStream(reader)
            let lexer = new Lexer(stream)
            let pdfObj = lexer.getIndirectObject()
            console.log(pdfObj.toJson())
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
            // \101\\r\n\102\\r\103\\n\104
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