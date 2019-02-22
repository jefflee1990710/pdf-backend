import 'babel-polyfill'
import assert from 'assert'
import { BufferStream } from '../src/buffer-stream';

describe('BufferStream', () => {

    describe('#getByte()', () => {
        it("should return 0x00 for first byte", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.equal(bs.getByte(), 0x00)
        })
        it("should return 0x01 for second byte", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.equal(bs.getByte(), 0x00)
            assert.equal(bs.getByte(), 0x01)
        })
    })

    describe('#getBytes(length)', () => {
        it("should return [0x00, 0x01] for first 2 bytes", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.getBytes(2), Buffer.from([0x00, 0x01]))
        })
        it("should return empty buffer", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            assert.deepEqual(bs.getBytes(0), Buffer.from([]))
        })
        it("should return null if offset meet end of stream", () => {
            let buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
            let bs = new BufferStream(buffer)
            bs.getBytes(4)
            assert.deepEqual(bs.getBytes(1), null)
        })
    })

    describe('#hasNext()', () => {
        
    })

})
