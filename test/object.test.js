import "babel-polyfill"
import assert from 'assert'

import {ByteArrayReader} from '../src/reader'
import config from 'config'
import BufferStream from "../src/buffer-stream";
import {Integer} from '../src/object'

let pdfEncoding = config.get('pdf.encoding')

describe('Integer', () => {    
    describe('#fillBy(stream)', () => {
        it("should return 1234", () => {
            let reader = new ByteArrayReader(Buffer.from("1234", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, 1234)
            assert.equal(bufferStream.position, 4)
        })
        it("should return 434415", () => {
            let reader = new ByteArrayReader(Buffer.from("434415", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, 434415)
            assert.equal(bufferStream.position, 6)
        })
        it("should return 17 for +17", () => {
            let reader = new ByteArrayReader(Buffer.from("+17", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, 17)
            assert.equal(bufferStream.position, 3)
        })
        it("should return -98 for -98", () => {
            let reader = new ByteArrayReader(Buffer.from("-98", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, -98)
            assert.equal(bufferStream.position, 3)
        })
        it("should return 0", () => {
            let reader = new ByteArrayReader(Buffer.from("0", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, 0)
            assert.equal(bufferStream.position, 1)
        })
        it("should return 768 for 768abc", () => {
            let reader = new ByteArrayReader(Buffer.from("768abc", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, 768)
            assert.equal(bufferStream.position, 3)
        })
        it("should return -768 for -768abc", () => {
            let reader = new ByteArrayReader(Buffer.from("-768abc", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, true)
            assert.equal(i.value, -768)
            assert.equal(bufferStream.position, 4)
        })
        it("should return false and position unchange when fill in non-integer object", () => {
            let reader = new ByteArrayReader(Buffer.from("abc", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, false)
            assert.equal(bufferStream.position, 0)
        })
        it("should return false and position unchange if the stream is not start with integer but including integer in the middle", () => {
            let reader = new ByteArrayReader(Buffer.from("abc1234", pdfEncoding))
            let bufferStream = new BufferStream(reader)
            let i = new Integer()
            let filled = i.fillBy(bufferStream)
            assert.equal(filled, false)
            assert.equal(bufferStream.position, 0)
        })
    })
})