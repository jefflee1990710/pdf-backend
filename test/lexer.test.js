import "babel-polyfill"
import assert from 'assert'

import {ByteArrayReader} from '../src/reader'
import Lexer from '../src/lexer'
import config from 'config'

describe('Lexer', () => {
    let pdfEncoding = config.get('pdf.encoding')
    describe('#nextChar()', () => {
        it('should return "A" for "BCDEF" at offset 0', () => {
            let reader = new ByteArrayReader(Buffer.from("ABCDEF", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            assert.equal(lexer.nextChar().toString(), 'A')
        })
        it('should return "B" for "BCDEF" at offset 1', () => {
            let reader = new ByteArrayReader(Buffer.from("ABCDEF", pdfEncoding))
            let lexer = new Lexer(reader.toStream(1))
            assert.equal(lexer.nextChar().toString(), 'A')
        })
        it('should return F for the last one', () => {
            let reader = new ByteArrayReader(Buffer.from("ABC", pdfEncoding))
            let lexer = new Lexer(reader.toStream(1))
            lexer.nextChar()
            lexer.nextChar()
            assert.equal(lexer.nextChar().toString(), 'C')
        })
        it('should return null for this end of stream', () => {
            let reader = new ByteArrayReader(Buffer.from("AB", pdfEncoding))
            let lexer = new Lexer(reader.toStream(1))
            lexer.nextChar()
            lexer.nextChar()
            let nextchar = lexer.nextChar()
            assert.equal(nextchar, null)
        })
    })

    describe('#getNumber()', () => {
        it('should return 123', () => {
            let reader = new ByteArrayReader(Buffer.from("123", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            let numStr = lexer.getNumber()
            assert.equal(numStr, '123')
        })
        it('should return 43445', () => {
            let reader = new ByteArrayReader(Buffer.from("43445", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            let numStr = lexer.getNumber()
            assert.equal(numStr, '43445')
        })
        it('should return +17', () => {
            let reader = new ByteArrayReader(Buffer.from("+17", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            let numStr = lexer.getNumber()
            assert.equal(numStr, '+17')
        })
        it('should return -98', () => {
            let reader = new ByteArrayReader(Buffer.from("-98", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            let numStr = lexer.getNumber()
            assert.equal(numStr, '-98')
        })
        it('should return 0', () => {
            let reader = new ByteArrayReader(Buffer.from("0", pdfEncoding))
            let lexer = new Lexer(reader.toStream())
            let numStr = lexer.getNumber()
            assert.equal(numStr, '0')
        })
    })
})