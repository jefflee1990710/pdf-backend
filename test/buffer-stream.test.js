import 'babel-polyfill'
import assert from 'assert'
import {FileReader} from '../src/reader'
import {BufferStream} from '../src/buffer-stream';

describe('BufferStream', () => {

    describe('#getByte()', () => {
        it("should return 0x25 for first byte, and position at 0", () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.getByte(), Buffer.from([0x25]))
            assert.equal(bs.position, 0)
        })
        it("should return 0x50 for second byte, and position at 1", () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.getByte(), Buffer.from([0x25]))
            assert.deepEqual(bs.getByte(), Buffer.from([0x50]))
            assert.equal(bs.position, 1)
        })
    })

    describe('#getBytes(length)', () => {
        it("should return [0x25, 0x50] for first 2 bytes, and position at 1", () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.getBytes(2), Buffer.from([0x25, 0x50]))
            assert.equal(bs.position, 1)
        })
        it("should return empty buffer, and position unchange", () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.getBytes(0), Buffer.from([]))
            assert.equal(bs.position, -1)
        })
        it("should throw exception when get bytes length exceed file limit", () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.throws(() => {
                bs.getBytes(5000)
            })
        })
    })

    describe('#skip(length)', () => {
        it('should return 0x01 after skip 1 from start, and position at 2', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            bs.skip(1)
            assert.deepEqual(bs.getByte(), Buffer.from([0x50]))
            assert.equal(bs.position, 1)
        })
        it('should return 0x03 after skip 3 from start, and position at 4', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            bs.skip(3)
            assert.deepEqual(bs.getByte(), Buffer.from([0x46]))
            assert.equal(bs.position, 3)
        })
        it('should return null if skip to end and read at the end of stream', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.throws(() => {
                bs.skip(5000)
            })
        })
        
    })
    
    describe('#peekByte()', () => {
        it('should return 0x25 when peek byte from position 0, and position not change', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.peekByte(), Buffer.from([0x25]))
            assert.equal(bs.position, -1)
        })
    })

    describe('#peekBytes(length)', () => {
        it('should return [0x00, 0x01, 0x02, 0x03] when peek 4 byte from position 0, and position not change', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.peekBytes(4), Buffer.from([0x25, 0x50, 0x44, 0x46]))
            assert.equal(bs.position, -1)
        })
        it('should return [] when peek 0 byte from position 0, and position not change', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            assert.deepEqual(bs.peekBytes(0), Buffer.from([]))
            assert.equal(bs.position, -1)
        })
    })

    describe('#hasNext()', () => {
        it('should return true if position at 0', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.equal(bs.hasNext(), true)
        })
        it('should return true if position at 1', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.skip(1)
            assert.equal(bs.hasNext(), true)
        })
        it('should return false if position at 4', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.skip(4)
            assert.equal(bs.hasNext(), false)
        })
    })

    describe('#reset()', () => {
        
    })

})
