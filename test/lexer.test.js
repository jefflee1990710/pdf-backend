import "babel-polyfill"
import assert from 'assert'

import {ByteArrayReader} from '../src/reader'
import Lexer from '../src/lexer'

describe('Lexer', () => {
    describe('#nextChar()', () => {
        it('should return "A" for "BCDEF" at offset 0', () => {
            let reader = new ByteArrayReader(Buffer.from("ABCDEF", "ascii"))
            let lexer = new Lexer(reader.toStream())
            assert.equal(lexer.nextChar().toString(), 'A')
        })
        it('should return "B" for "BCDEF" at offset 1', () => {
            let reader = new ByteArrayReader(Buffer.from("ABCDEF", "ascii"))
            let lexer = new Lexer(reader.toStream(1))
            assert.equal(lexer.nextChar().toString(), 'A')
        })
        it('should return F for the last one', () => {
            let reader = new ByteArrayReader(Buffer.from("ABC", "ascii"))
            let lexer = new Lexer(reader.toStream(1))
            lexer.nextChar()
            lexer.nextChar()
            assert.equal(lexer.nextChar().toString(), 'C')
        })
        it('should return null for this end of stream', () => {
            let reader = new ByteArrayReader(Buffer.from("AB", "ascii"))
            let lexer = new Lexer(reader.toStream(1))
            lexer.nextChar()
            lexer.nextChar()
            let nextchar = lexer.nextChar()
            assert.equal(nextchar, null)
        })
    })
})