import "babel-polyfill"
import assert from 'assert'

import {FileOffsetReader} from '../src/reader'

describe('FileOffsetReader', () => {
    describe('#getByte(offset)', () => {
        it('should return "P" for offset 1 in sample.pdf', () => {
            let provider = new FileOffsetReader("./pdf-sample/sample.pdf")
            let r = provider.getByte(1).toString('ascii')
            assert.equal(r, 'P')
        })
        it('should return null for reading after end of file', () => {
            let provider = new FileOffsetReader("./pdf-sample/sample.pdf")
            let r = provider.getByte(100000)
            assert.equal(r, null)
        })
    })
    describe('#getBytes(offset, length)', () => {
        it('should return "PDF" for offset 1 and length 3 in sample.pdf', () => {
            let provider = new FileOffsetReader("./pdf-sample/sample.pdf")
            let r = provider.getBytes(1, 3).toString('ascii')
            assert.equal(r, 'PDF')
        })
    })
})