import 'babel-polyfill'
import assert from 'assert'
import {FileReader, ByteArrayReader} from '../src/reader'
import BufferStream from '../src/buffer-stream';
import config from 'config'
import {expect} from 'chai' 

let pdfEncoding = config.get('pdf.encoding')

describe('BufferStream', () => {

    describe('#getByte()', () => {
        it("read first byte from reader", () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            assert.equal(bs.getByte(), 0x01)
            assert.equal(bs.position, 1)
        })
        it("read first two byte from reader", () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            assert.equal(bs.getByte(), 0x01)
            assert.equal(bs.getByte(), 0x02)
            assert.equal(bs.position, 2)
        })
        it("return null if the data reach the end of the stream", () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02]))
            let bs = new BufferStream(reader)
            assert.equal(bs.getByte(), 0x01)
            assert.equal(bs.getByte(), 0x02)
            assert.equal(bs.getByte(), null)
            assert.equal(bs.position, 2)
        })
        it("return null for reading empty stream", () => {
            let reader = new ByteArrayReader(Buffer.from([]))
            let bs = new BufferStream(reader)
            assert.equal(bs.getByte(), null)
            assert.equal(bs.position, 0)
        })
    })

    describe('#getBytes', () => {
        it('return first 5 bytes from stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]))
            let bs = new BufferStream(reader)
            expect(bs.getBytes(5)).is.deep.eq(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]))
            assert.equal(bs.position, 5)
        })
        it('return 5 bytes from position 2 from stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]))
            let bs = new BufferStream(reader)
            bs.getByte()
            bs.getByte()
            expect(bs.getBytes(3)).is.deep.eq(Buffer.from([0x03, 0x04, 0x05]))
            assert.equal(bs.position, 5)
        })
    })

    describe('#peekByte()', () => {
        it('read first byte and position remain unchange', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            assert.equal(bs.peekByte(), 0x01)
            assert.equal(bs.peekByte(), 0x01)
            assert.equal(bs.position, 0)
        })
        it('return null for peeking empty stream', () => {
            let reader = new ByteArrayReader(Buffer.from([]))
            let bs = new BufferStream(reader)
            assert.equal(bs.peekByte(), null)
            assert.equal(bs.position, 0)
        })
    })

    describe('#moveTo', () => {
        it('move to expected offset of stream', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            bs.moveTo(2)
            expect(bs.position).is.equal(2)
        })
        it('read expect byte from moved offset', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            bs.moveTo(2)
            expect(bs.getByte()).is.equal(0x03)
        })
    })

    describe('#hasNext()', () => {
        it('return true if the stream is not ned', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            bs.skip()
            assert.equal(bs.hasNext(), true)
        })
        it('return false if the stream is end', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02]))
            let bs = new BufferStream(reader)
            bs.skip(2)
            assert.equal(bs.hasNext(), false)
        })
        it('return false if the stream is empty', () => {
            let reader = new ByteArrayReader(Buffer.from([]))
            let bs = new BufferStream(reader)
            assert.equal(bs.hasNext(), false)
        })
    })

    describe('#find(needle, limit)', () => {
        it('search first 7 position and stop at it position', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 8)
            assert.equal(result, true)
            assert.equal(bs.position, 6)
        })
        it('return no result for first 5 position and target at 6', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 6)
            assert.equal(result, false)
            assert.equal(bs.position, 0)
        })
        it('return true if target sit just on the boundary of limited length', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 7)
            assert.equal(result, true)
            assert.equal(bs.position, 6)
        })

        const TEST_STR_1 = `1 0 obj <<>> 2 0 obj <<>>`
        it('search first 18 (target at 17) position and stop at it position', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 15)
            assert.equal(result, true)
            assert.equal(bs.position, 13)
        })
        it('return no result for first 16 position and target at 18', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 13)
            assert.equal(result, false)
            assert.equal(bs.position, 0)
        })
        it('return true if target sit just on the boundary of limited length', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 14)
            assert.equal(result, true)
            assert.equal(bs.position, 13)
        })
    })

    describe('#findBackward(needle, limit)', () => {
        it('search first 7 position and stop at it position', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 8)
            assert.equal(result, true)
            assert.equal(bs.position, 6)
        })
        it('return no result for first 5 position and target at 6', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 6)
            assert.equal(result, false)
            assert.equal(bs.position, 0)
        })
        it('return true if target sit just on the boundary of limited length', () => {
            let reader = new ByteArrayReader(Buffer.from('1 2 3 4 5 6 7', pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("4", 7)
            assert.equal(result, true)
            assert.equal(bs.position, 6)
        })

        const TEST_STR_1 = `1 0 obj <<>> 2 0 obj <<>>`
        it('search first 18 (target at 17) position and stop at it position', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 15)
            assert.equal(result, true)
            assert.equal(bs.position, 13)
        })
        it('return no result for first 16 position and target at 18', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 13)
            assert.equal(result, false)
            assert.equal(bs.position, 0)
        })
        it('return true if target sit just on the boundary of limited length', () => {
            let reader = new ByteArrayReader(Buffer.from(TEST_STR_1, pdfEncoding))
            let bs = new BufferStream(reader)
            let result = bs.find("2 0 obj", 14)
            assert.equal(result, true)
            assert.equal(bs.position, 13)
        })
    })

    describe('#reset()', () => {
        it('should reset position to -1, which is starting to read (next is 0 offset)', () => {
            let reader = new FileReader("./pdf-sample/sample.pdf")
            let bs = new BufferStream(reader)
            bs.skip(1)
            assert.equal(bs.position, 1)
            bs.reset()
            assert.equal(bs.position, 0)
        })
    })

    describe('#restorePosition', () => {
        it('able to restore existed position', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            expect(bs.position).is.eq(0)
            let addr = bs.savePosition()
            bs.moveTo(3)
            expect(bs.position).is.eq(3)
            bs.restorePosition(addr)
            expect(bs.position).is.eq(0)
        })
        it('throw if restore a not exist position', () => {
            let reader = new ByteArrayReader(Buffer.from([0x01, 0x02, 0x03, 0x04]))
            let bs = new BufferStream(reader)
            expect(() => {
                bs.restorePosition('anything')
            }).to.throw()
        })
    })

})
