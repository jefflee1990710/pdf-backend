import 'babel-polyfill'
import assert from 'assert'
import { BufferStream } from '../src/buffer-stream';

describe('BufferStream', () => {

    describe('#nextByte()', () => {
        it("should return 0x00 for first byte, and position at 1", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.nextByte(), Buffer.from([0x00]))
            assert.equal(bs.position, 0)
        })
        it("should return 0x01 for second byte, and position at 2", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.nextByte(), Buffer.from([0x00]))
            assert.deepEqual(bs.nextByte(), Buffer.from([0x01]))
            assert.equal(bs.position, 1)
        })
    })

    describe('#nextBytes(length)', () => {
        it("should return [0x00, 0x01] for first 2 bytes, and position at 2", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.nextBytes(2), Buffer.from([0x00, 0x01]))
            assert.equal(bs.position, 1)
        })
        it("should return empty buffer, and position unchange", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.nextBytes(0), Buffer.from([]))
            assert.equal(bs.position, -1)
        })
        it("should return null if offset meet end of stream", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.nextBytes(4)
            assert.deepEqual(bs.nextBytes(1), null)
        })
    })

    describe('#skip(length)', () => {
        it('should return 0x01 after skip 1 from start, and position at 2', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.skip(1)
            assert.deepEqual(bs.nextByte(), Buffer.from([0x01]))
            assert.equal(bs.position, 1)
        })
        it('should return 0x03 after skip 3 from start, and position at 4', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.skip(3)
            assert.deepEqual(bs.nextByte(), Buffer.from([0x03]))
            assert.equal(bs.position, 3)
        })
        it('should return null if skip to end and read at the end of stream', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.skip(4)
            assert.equal(bs.position, 3)
            assert.deepEqual(bs.nextByte(), null)
        })
        
    })
    
    describe('#peekByte()', () => {
        it('should return 0x00 when peek byte from position 0, and position not change', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            console.log(bs.peekByte())
            assert.deepEqual(bs.peekByte(), Buffer.from([0x00]))
            assert.equal(bs.position, -1)
        })
    })

    describe('#peekBytes(length)', () => {
        it('should return [0x00, 0x01, 0x02, 0x03] when peek 4 byte from position 0, and position not change', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.peekBytes(4), Buffer.from([0x00, 0x01, 0x02, 0x03]))
            assert.equal(bs.position, -1)
        })
        it('should return [] when peek 0 byte from position 0, and position not change', () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
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
