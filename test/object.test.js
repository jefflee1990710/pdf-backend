import "babel-polyfill"
import BufferStream from '../src/buffer-stream'
import {ByteArrayReader, FileReader} from '../src/reader'
import config from 'config'
import {expect} from 'chai'

import PDFLineBreak from "../src/object/PDFLineBreak";
import PDFSpace from "../src/object/PDFSpace";
import PDFCmd from '../src/object/PDFCmd'
import PDFOr from '../src/object/condition/PDFOr'
import PDFAnd from "../src/object/condition/PDFAnd";
import PDFNull from "../src/object/PDFNull";
import PDFBoolean from "../src/object/PDFBoolean";
import PDFReal from "../src/object/PDFReal";
import PDFOctal from "../src/object/PDFOctal";
import PDFLiteralString from "../src/object/string/PDFLiteralString";
import PDFHexadecimalString from "../src/object/string/PDFHexadecimalString";
import PDFName from "../src/object/PDFName";
import PDFArray from "../src/object/PDFArray";
import PDFObjectReference from "../src/object/PDFObjectReference";
import PDFDict from "../src/object/PDFDict";
import PDFStreamContent from "../src/object/PDFStreamContent";
import PDFXRefTable from "../src/object/pdf/PDFXRefTable";


let pdfEncoding = config.get('pdf.encoding')

describe('PDFObject', () =>{

    describe('PDFOr', () => {
        describe('#pipe()', () => {
            it('can read either one of other', () => {
                let reader = new ByteArrayReader(Buffer.from('<<', pdfEncoding))
                let stream = new BufferStream(reader)
                let or = new PDFOr()
                or.in = () => {
                    return [new PDFCmd('<<'), new PDFCmd('>>')]
                }
                let result = or.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(2)
            })
            it('can read either one of other', () => {
                let reader = new ByteArrayReader(Buffer.from('>>', pdfEncoding))
                let stream = new BufferStream(reader)
                let or = new PDFOr()
                or.in = () => {
                    return [new PDFCmd('<<'), new PDFCmd('>>')]
                }
                let result = or.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(2)
            })
            it('return null of none of the choice found', () => {
                let reader = new ByteArrayReader(Buffer.from('AA', pdfEncoding))
                let stream = new BufferStream(reader)
                let or = new PDFOr()
                or.in = () => {
                    return [new PDFCmd('<<'), new PDFCmd('>>')]
                }
                let result = or.pipe(stream)
                expect(result).is.null
                expect(stream.position).is.eq(0)
            })
        })
    })

    describe('PDFAnd', () => {
        describe('#pipe()', () => {
            it('can read either one of other', () => {
                let reader = new ByteArrayReader(Buffer.from('<<aa>>', pdfEncoding))
                let stream = new BufferStream(reader)
                let and = new PDFAnd()
                and.in = () => {
                    return [
                        new PDFCmd('<<', {name : 'start'}), 
                        new PDFCmd('aa', {name : 'body'}), 
                        new PDFCmd('>>', {name : 'end'})]
                }
                let result = and.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(6)
                expect(stream.position).is.eq(6)
            })
            it('fail if any of its fail', () => {
                let reader = new ByteArrayReader(Buffer.from('<<aa>>', pdfEncoding))
                let stream = new BufferStream(reader)
                let and = new PDFAnd()
                and.in = () => {
                    return [
                        new PDFCmd('<<', {name : 'start'}), 
                        new PDFCmd('aaa', {name : 'body'}), 
                        new PDFCmd('>>', {name : 'end'})]
                }   
                let result = and.pipe(stream)
                expect(result).is.null
                expect(stream.position).is.eq(0)
            })
        })
    })

    describe('PDFSpace', () => {
        describe('#pipe()', () => {
            it('can read multiple space', () => {
                let reader = new ByteArrayReader(Buffer.from(' somethingbehind', pdfEncoding))
                let stream = new BufferStream(reader)
                let space = new PDFSpace()
                let result = space.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(1)
                expect(stream.position).is.eq(1)
            })
        })
    })

    describe('#getLineBreak', () => {
        describe('#pipe()', () => {
            it('can read \\r\\n', () => {
                let reader = new ByteArrayReader(Buffer.from('\r\nsomething', pdfEncoding))
                let stream = new BufferStream(reader)
                let lb = new PDFLineBreak()
                let result = lb.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(2)
            })
            it('can read \\r', () => {
                let reader = new ByteArrayReader(Buffer.from('\rsomething', pdfEncoding))
                let stream = new BufferStream(reader)
                let lb = new PDFLineBreak()
                let result = lb.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(1)
                expect(stream.position).is.eq(1)
            })
            it('can read \\n', () => {
                let reader = new ByteArrayReader(Buffer.from('\nsomething', pdfEncoding))
                let stream = new BufferStream(reader)
                let lb = new PDFLineBreak()
                let result = lb.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(1)
                expect(stream.position).is.eq(1)
            })
        })
    })

    describe('PDFCmd', () => {
        describe('#pipe()', () => {
            it('can read cmd as string', () => {
                let reader = new ByteArrayReader(Buffer.from('<<dict start>>', pdfEncoding))
                let stream = new BufferStream(reader)
                let cmd = new PDFCmd('<<')
                let result = cmd.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(2)
            })
            it('can read cmd as string with suffix', () => {
                let reader = new ByteArrayReader(Buffer.from('  truesuffix', pdfEncoding))
                let stream = new BufferStream(reader)
                stream.moveTo(2)
                let cmd = new PDFCmd('true')
                let result = cmd.pipe(stream)
                expect(result.start).is.eq(2)
                expect(result.length).is.eq(4)
                expect(stream.position).is.eq(6)
            })
            it('can read cmd at the end of the stream', () => {
                let reader = new ByteArrayReader(Buffer.from('  <<', pdfEncoding))
                let stream = new BufferStream(reader)
                stream.moveTo(2)
                let cmd = new PDFCmd('<<')
                let result = cmd.pipe(stream)
                expect(result.start).is.eq(2)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(4)
            })
            it('null for command not found', () => {
                let reader = new ByteArrayReader(Buffer.from('  <<', pdfEncoding))
                let stream = new BufferStream(reader)
                let cmd = new PDFCmd('>>')
                let result = cmd.pipe(stream)
                expect(result).is.null
                expect(stream.position).is.eq(0)
            })
        })
    })

    describe('PDFNull', () => {
        describe('#pipe()', () =>{
            it('can read null by keyword', () => {
                let reader = new ByteArrayReader(Buffer.from('  null', pdfEncoding))
                let stream = new BufferStream(reader)
                stream.moveTo(2)
                let nullobj = new PDFNull()
                let result = nullobj.pipe(stream)
                expect(nullobj.filled).is.true
                expect(result.start).is.eq(2)
                expect(result.length).is.eq(4)
                expect(stream.position).is.eq(6)
            })
        })
    })
    
    describe('PDFBoolean', () => {
        describe('#pipe()', () =>{
            it('can read true', () => {
                let reader = new ByteArrayReader(Buffer.from('  true', pdfEncoding))
                let stream = new BufferStream(reader)
                new PDFSpace().pipe(stream)
                let bool = new PDFBoolean()
                let result = bool.pipe(stream)
                expect(bool.filled).is.true
                expect(result.start).is.eq(2)
                expect(result.length).is.eq(4)
                expect(stream.position).is.eq(6)
            })
            it('can read false', () => {
                let reader = new ByteArrayReader(Buffer.from('  false', pdfEncoding))
                let stream = new BufferStream(reader)
                new PDFSpace().pipe(stream)
                let bool = new PDFBoolean()
                let result = bool.pipe(stream)
                expect(bool.filled).is.true
                expect(result.start).is.eq(2)
                expect(result.length).is.eq(5)
                expect(stream.position).is.eq(7)
            })
            it('return null with nothing detected', () => {
                let reader = new ByteArrayReader(Buffer.from('  test', pdfEncoding))
                let stream = new BufferStream(reader)
                new PDFSpace().pipe(stream) // Move to 2
                let bool = new PDFBoolean()
                let result = bool.pipe(stream)
                expect(result).is.null
                expect(bool.filled).is.false
                expect(stream.position).is.eq(2)
            })
        })
    })

    describe('PDFReal', () => {
        describe('#pipe()', () =>{
            it('can read PostScript script for number (real and integer)', () => {
                let numbers = ['34.5 ', '-3.62 ', '+123.4 ', '4.0 ', '-.002 ', '0.0 ', '123 ', '43445 ', '+17 ', '-98 ', '0 '];
                for (var i = 0; i < numbers.length; i++) {
                    let num = numbers[i];
                    let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                    let stream = new BufferStream(reader)
                    let realobj = new PDFReal()
                    let result = realobj.pipe(stream)
                    expect(realobj.value).is.eq(parseFloat(num));
                    expect(realobj.filled).is.true
                    expect(result.start).is.eq(0)
                    expect(result.length, `length of ${num}`).is.eq(num.length - 1)
                }
            })
            it('should return null for non number object', () => {
                let numbers = ['(123)', 'abc', '!@#'];
                for (var i = 0; i < numbers.length; i++) {
                    let num = numbers[i];
                    let reader = new ByteArrayReader(Buffer.from(num, pdfEncoding))
                    let stream = new BufferStream(reader)
                    let realobj = new PDFReal()
                    let result = realobj.pipe(stream)
                    expect(result).is.null
                    expect(realobj.filled).is.false
                }
            })
        })
    })

    describe('PDFOctal', () => {
        describe('#pipe()', () =>{
            it('can read octal with three digital', () => {
                let reader = new ByteArrayReader(Buffer.from('\\101 ', pdfEncoding))
                let stream = new BufferStream(reader)
                let octal = new PDFOctal()
                let result = octal.pipe(stream)
                expect(octal.value).is.eq('A')
                expect(octal.filled).is.true
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(4)
                expect(stream.position).is.eq(4)
            })
            it('can read octal with two digital', () => {
                let reader = new ByteArrayReader(Buffer.from('\\51 ', pdfEncoding))
                let stream = new BufferStream(reader)
                let octal = new PDFOctal()
                let result = octal.pipe(stream)
                expect(octal.value).is.eq(')')
                expect(octal.filled).is.true
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(3)
                expect(stream.position).is.eq(3)
            })
        })
    })

    describe('PDFLiteralString', () => {
        describe('#pipe()', () =>{
            it('can read single parenthsis string', () => {
                let reader = new ByteArrayReader(Buffer.from('(this is a simple string)', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFLiteralString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('this is a simple string')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(25)
                expect(stream.position).is.eq(25)
            })
            it('can read string contain new line', () => {
                let reader = new ByteArrayReader(Buffer.from('(This is a string \n with new line)', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFLiteralString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('This is a string \n with new line')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(34)
                expect(stream.position).is.eq(34)
            })
            it('can read string with balanced parentheses', () => {
                let reader = new ByteArrayReader(Buffer.from('(This is a string (with balanced parentheses) no problem)', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFLiteralString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('This is a string (with balanced parentheses) no problem')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(57)
                expect(stream.position).is.eq(57)
            })
            it('can read string with 0 length', () => {
                let reader = new ByteArrayReader(Buffer.from('()', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFLiteralString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(2)
                expect(stream.position).is.eq(2)
            })
        })
    })

    describe('PDFLiteralString', () => {
        describe('#pipe()', () =>{
            it('can read paired hexdecimal string', () => {
                let reader = new ByteArrayReader(Buffer.from('<A3F234C4DEA0>', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFHexadecimalString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('A3F234C4DEA0')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(14)
                expect(stream.position).is.eq(14)
            })
            it('can read hexdecimal string missing last zero', () => {
                let reader = new ByteArrayReader(Buffer.from('<A3F234C4DEA>', pdfEncoding))
                let stream = new BufferStream(reader)
                let string = new PDFHexadecimalString()
                let result = string.pipe(stream)
                expect(string.toString()).is.eq('A3F234C4DEA0')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(13)
                expect(stream.position).is.eq(13)
            })
        })
    })

    describe('PDFName', () => {
        describe('#pipe()', () =>{
            it('read a simple name', () => {
                let reader = new ByteArrayReader(Buffer.from('/Name1', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('Name1')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(6)
                expect(stream.position).is.eq(6)
            })
            it('read a longer name', () => {
                let reader = new ByteArrayReader(Buffer.from('/ThisIsAMuchLongerName', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('ThisIsAMuchLongerName')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(22)
                expect(stream.position).is.eq(22)
            })
            it('read a name with various character', () => {
                let reader = new ByteArrayReader(Buffer.from('/A;Name_With-Various***Characters?', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('A;Name_With-Various***Characters?')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(34)
                expect(stream.position).is.eq(34)
            })
            it('read a name with number', () => {
                let reader = new ByteArrayReader(Buffer.from('/1.2', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('1.2')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(4)
                expect(stream.position).is.eq(4)
            })
            it('read a name with dollor sign', () => {
                let reader = new ByteArrayReader(Buffer.from('/$$', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('$$')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(3)
                expect(stream.position).is.eq(3)
            })
            it('read a name with @', () => {
                let reader = new ByteArrayReader(Buffer.from('/@pattern', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('@pattern')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(9)
                expect(stream.position).is.eq(9)
            })
            it('read a name start with dot', () => {
                let reader = new ByteArrayReader(Buffer.from('/.notdef', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('.notdef')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(8)
                expect(stream.position).is.eq(8)
            })
            it('read a name with number sign', () => {
                let reader = new ByteArrayReader(Buffer.from('/lime#20green', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('lime green')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(13)
                expect(stream.position).is.eq(13)
            })
            it('read a name with parentheses', () => {
                let reader = new ByteArrayReader(Buffer.from('/lime#28#29green', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('lime()green')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(16)
                expect(stream.position).is.eq(16)
            })
            it('read a name with #', () => {
                let reader = new ByteArrayReader(Buffer.from('/lime#23green', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('lime#green')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(13)
                expect(stream.position).is.eq(13)
            })
            it('read a name which normal character is number sign', () => {
                let reader = new ByteArrayReader(Buffer.from('/A#42', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('AB')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(5)
                expect(stream.position).is.eq(5)
            })
            it('read a name which normal character is number sign with non-ended stream', () => {
                let reader = new ByteArrayReader(Buffer.from('/A#42  ', pdfEncoding))
                let stream = new BufferStream(reader)
                let name = new PDFName()
                let result = name.pipe(stream)
                expect(name.value).is.eq('AB')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(5)
                expect(stream.position).is.eq(5)
            })
        })
    })

    describe('PDFObjectReference', () => {
        describe('#pipe()', () =>{
            it('can read normal object reference', () => {
                let reader = new ByteArrayReader(Buffer.from('12 0 R', pdfEncoding))
                let stream = new BufferStream(reader)
                let or = new PDFObjectReference()
                let result = or.pipe(stream)
                expect(or.objectNumber.value).is.eq(12)
                expect(or.generationNumber.value).is.eq(0)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(6)
                expect(stream.position).is.eq(6)
            })

        })
    })

    describe('PDFArray', () => {
        describe('#pipe()', () =>{
            it('can read real array', () => {
                let reader = new ByteArrayReader(Buffer.from('[1 2 3 4]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].value).is.eq(1)
                expect(array.elements[1].value).is.eq(2)
                expect(array.elements[2].value).is.eq(3)
                expect(array.elements[3].value).is.eq(4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(9)
                expect(stream.position).is.eq(9)
            })
            it('can read literial string array', () => {
                let reader = new ByteArrayReader(Buffer.from('[ (string 1) (string 2) (string 3)]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].toString()).is.eq('string 1')
                expect(array.elements[1].toString()).is.eq('string 2')
                expect(array.elements[2].toString()).is.eq('string 3')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(35)
                expect(stream.position).is.eq(35)
            })
            it('can read array in a array', () => {
                let reader = new ByteArrayReader(Buffer.from('[ [1 2][3 4]]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].elements[0].value).is.eq(1)
                expect(array.elements[1].elements[1].value).is.eq(4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(13)
                expect(stream.position).is.eq(13)
            })
            it('have a linebreak in the middle of the array', () => {
                let reader = new ByteArrayReader(Buffer.from('[1 2\n 3\r\n 4]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].value).is.eq(1)
                expect(array.elements[1].value).is.eq(2)
                expect(array.elements[2].value).is.eq(3)
                expect(array.elements[3].value).is.eq(4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(12)
                expect(stream.position).is.eq(12)
            })
            it('can read a simple real number array', () => {
                let reader = new ByteArrayReader(Buffer.from('[3.5 -33.2 12 -.32]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].value).is.eq(3.5)
                expect(array.elements[1].value).is.eq(-33.2)
                expect(array.elements[2].value).is.eq(12)
                expect(array.elements[3].value).is.eq(-0.32)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(19)
                expect(stream.position).is.eq(19)
            })
            it('can read a array with mixed object', () => {
                let reader = new ByteArrayReader(Buffer.from('[3.5 /Name1 (I am a String) <A3F234C4DEA0> [12 13 14]]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].value).is.eq(3.5)
                expect(array.elements[1].value).is.eq('Name1')
                expect(array.elements[2].toString()).is.eq('I am a String')
                expect(array.elements[3].toString()).is.eq('A3F234C4DEA0')
                expect(array.elements[4].elements[0].value).is.eq(12)
                expect(array.elements[4].elements[1].value).is.eq(13)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(54)
                expect(stream.position).is.eq(54)
            })
            it('can read array with name', () => {
                let reader = new ByteArrayReader(Buffer.from('[/Name1 /Name2 /Name3 /Name4]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].value).is.eq('Name1')
                expect(array.elements[1].value).is.eq('Name2')
                expect(array.elements[2].value).is.eq('Name3')
                expect(array.elements[3].value).is.eq('Name4')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(29)
                expect(stream.position).is.eq(29)
            })
            it('can read a empty array', () => {
                let reader = new ByteArrayReader(Buffer.from('[ ]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements.length).is.eq(0)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(3)
                expect(stream.position).is.eq(3)
            })
            it('can read object reference array', () => {
                let reader = new ByteArrayReader(Buffer.from('[ 1 0 R 2 0 R 3 0 R 4 0 R]', pdfEncoding))
                let stream = new BufferStream(reader)
                let array = new PDFArray()
                let result = array.pipe(stream)
                expect(array.elements[0].objectNumber.value).is.eq(1)
                expect(array.elements[1].objectNumber.value).is.eq(2)
                expect(array.elements[2].objectNumber.value).is.eq(3)
                expect(array.elements[3].objectNumber.value).is.eq(4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(26)
                expect(stream.position).is.eq(26)
            })
        })
    })

    describe('PDFDict', () => {
        describe('#pipe()', () =>{
            it('can read normal integer dict', () => {
                let reader = new ByteArrayReader(Buffer.from('<</Field1 1 /Field2 2>>', pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content.Field1.hit.value).is.eq(1)
                expect(dict.content.Field2.hit.value).is.eq(2)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(23)
                expect(stream.position).is.eq(23)
            })
            it('can read a simple dictionary', () => {
                let strbuf = [
                    "<< /Type /Example",
                    "/Version 0.01 >>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['Type'].hit.value).is.eq('Example')
                expect(dict.content['Version'].hit.value).is.eq(0.01)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(34)
                expect(stream.position).is.eq(34)
            })
            it('can read dictionary with a sub dictionary', () => {
                let strbuf = [
                    "<< /Type /Example",
                    "/Version 0.01 /Subdictionary <</Item 0.4>> >>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['Type'].hit.value).is.eq('Example')
                expect(dict.content['Version'].hit.value).is.eq(0.01)
                expect(dict.content['Subdictionary'].hit.content['Item'].hit.value).is.eq(0.4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(63)
                expect(stream.position).is.eq(63)
            })
            it('can read dictionary with array', () => {
                let strbuf = [
                    "<< /Type /Example",
                    "/Version 0.01 /Array [1 2 3 (String here)] >>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['Type'].hit.value).is.eq('Example')
                expect(dict.content['Version'].hit.value).is.eq(0.01)
                expect(dict.content['Array'].hit.elements.length).is.eq(4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(63)
                expect(stream.position).is.eq(63)
            })
            it('can read dictionary without space', () => {
                let strbuf = [
                    "<</Type/Example/Subtype/Button>>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['Type'].hit.value).is.eq('Example')
                expect(dict.content['Subtype'].hit.value).is.eq('Button')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(32)
                expect(stream.position).is.eq(32)
            })
            it('can read dictionary with a sub dictionary', () => {
                let strbuf = [
                    "<< /Type /Example",
                    "/Version 0.01 /Subdictionary <</Item 0.4 /Subitem <</Integer 1/String (Ok here)>>>>>>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['Type'].hit.value).is.eq('Example')
                expect(dict.content['Version'].hit.value).is.eq(0.01)
                expect(dict.content['Subdictionary'].hit.content['Item'].hit.value).is.eq(0.4)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(103)
                expect(stream.position).is.eq(103)
            })
            it('can read xref stream header dict', () => {
                let strbuf = [
                    "<</DecodeParms<</Columns 4/Predictor 12>>/Filter/FlateDecode/ID[<4DC91A1875A6D707AEC203BB021C93A0><F6C92B368A8A13408457A1D395A37EB9>]/Index[7 21]/Info 6 0 R/Length 52/Prev 7657/Root 8 0 R/Size 28/Type/XRef/W[1 2 1]>>"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join("\n"), pdfEncoding))
                let stream = new BufferStream(reader)
                let dict = new PDFDict()
                let result = dict.pipe(stream)
                expect(dict.content['DecodeParms'].hit.content['Columns'].hit.value).is.eq(4)
                expect(dict.content['DecodeParms'].hit.content['Predictor'].hit.value).is.eq(12)
                expect(dict.content['Filter'].hit.value).is.eq('FlateDecode')
                expect(dict.content['ID'].hit.elements[0].toString()).is.eq('4DC91A1875A6D707AEC203BB021C93A0')
                expect(dict.content['ID'].hit.elements[1].toString()).is.eq('F6C92B368A8A13408457A1D395A37EB9')
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(216)
                expect(stream.position).is.eq(216)
            })

        })
    })

    describe('PDFStreamContent', () => {
        describe('#pipe()', () =>{
            it('can read normal stream content', () => {
                let strbuf = [
                    "stream",
                    Buffer.from([0x01, 0x02, 0x03, 0x04]).toString(config.get('pdf.encoding')),
                    "endstream"
                ]
                let reader = new ByteArrayReader(Buffer.from(strbuf.join('\n'), pdfEncoding))
                let stream = new BufferStream(reader)
                let sc = new PDFStreamContent()
                let result = sc.pipe(stream)
                expect(sc.buffer[0]).is.eq(0x01)
                expect(sc.buffer[1]).is.eq(0x02)
                expect(sc.buffer[2]).is.eq(0x03)
                expect(sc.buffer[3]).is.eq(0x04)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(21)
                expect(stream.position).is.eq(21)
            })
        })
    })

    describe('PDFXrefTable', () => {
        let strbuf = [
            "xref",
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
            "0000000938 00000 n",
            ""
        ]

        describe('#pipe()', () =>{
            it('can read simple xref table', () => {
                let reader = new ByteArrayReader(Buffer.from(strbuf.join('\n'), pdfEncoding))
                let stream = new BufferStream(reader)
                let xreftable = new PDFXRefTable()
                let result = xreftable.pipe(stream)
                expect(result.start).is.eq(0)
                expect(result.length).is.eq(184)
                expect(stream.position).is.eq(184)
            })
            it('can read a normal xref table from pdf file', () => {
                let reader = new FileReader('./pdf-sample/sample.pdf')
                let stream = new BufferStream(reader)
                stream.moveTo(2714)
                let xreftable = new PDFXRefTable()
                let result = xreftable.pipe(stream)
                expect(result).is.not.null
                expect(xreftable.toJSON().calculated.length).is.eq(10)
            })

        })

        describe('#toJSON', () => {
            it('can export xref table to json format', () => {
                let reader = new ByteArrayReader(Buffer.from(strbuf.join('\n'), pdfEncoding))
                let stream = new BufferStream(reader)
                let xreftable = new PDFXRefTable()
                let result = xreftable.pipe(stream)
                expect(result).is.not.null
                let json = xreftable.toJSON()
                expect(json.rows.length).is.eq(11)
            })
        })

        describe('#objectTable', () => {
            it('calculate the offset-object map from xref table', () => {
                let reader = new ByteArrayReader(Buffer.from(strbuf.join('\n'), pdfEncoding))
                let stream = new BufferStream(reader)
                let xreftable = new PDFXRefTable()
                let result = xreftable.pipe(stream)
                expect(result).is.not.null
                let objectTable = xreftable.objectTable
                expect(objectTable.length).is.eq(8)
            })
        })
    })
})