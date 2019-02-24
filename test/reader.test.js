import "babel-polyfill"
import assert from 'assert'
import config from 'config'

import {FileReader} from '../src/reader'

describe('FileOffsetReader', () => {
    describe('#getByte(offset)', () => {
        it('should return "P" for offset 1 in sample.pdf', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let r = reader.getByte(1).toString(config.get('pdf.encoding'))
            assert.equal(r, 'P')
        })
        it('should return null for reading after end of file', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let r = reader.getByte(100000)
            assert.equal(r, null)
        })
    })
    describe('#getBytes(offset, length)', () => {
        it('should return "PDF" for offset 1 and length 3 in sample.pdf', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let r = reader.getBytes(1, 3).toString(config.get('pdf.encoding'))
            assert.equal(r, 'PDF')
        })
    })
})