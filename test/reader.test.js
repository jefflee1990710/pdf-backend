import "babel-polyfill"
import assert from 'assert'
import config from 'config'

import {FileReader, ByteArrayReader} from '../src/reader'

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

describe('ByteArrayReader', () => {
    describe('#getByte(offset)', () => {
        it('should return 0x0B for offset 1 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            let buffer = reader.getByte(1)
            assert.equal(buffer[0], 2)
        })
        it('should return 5 for reading at offset 4', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            let buffer = reader.getByte(4)
            assert.equal(buffer[0], 5)
        })
        it('should throw ReaderOffsetExceedLimitError for reading at offset 5', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            try{
                reader.getByte(5)
            }catch(err){
                assert.equal(err.name, 'ReaderOffsetExceedLimitError')
            }
        })
        it('should throw ReaderOffsetExceedLimitError for reading after end of file', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            try{
                reader.getByte(10000)
            }catch(err){
                assert.equal(err.name, 'ReaderOffsetExceedLimitError')
            }
        })
    })
    describe('#getBytes(offset, length)', () => {
        it('should return [2, 3] for offset 1 and length 2 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            let buffer = reader.getBytes(1, 2)
            assert.deepEqual(buffer, Buffer.from([2, 3]))
        })
        it('should return [3, 4, 5] for offset 2 and length 3 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            let buffer = reader.getBytes(2, 3)
            assert.deepEqual(buffer, Buffer.from([3, 4, 5]))
        })
        it('should throw ReaderOffsetExceedLimitError for offset 2 and length 4 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            try{
                reader.getBytes(2, 4)
            }catch(err){
                assert.equal(err.name, 'ReaderOffsetExceedLimitError')
            }
        })
        it('should throw ReaderOffsetExceedLimitError for offset 5 and length 1 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            try{
                reader.getBytes(5, 1)
            }catch(err){
                assert.equal(err.name, 'ReaderOffsetExceedLimitError')
            }
        })
        it('should return [] for offset 2 and length 0 in byte array', () => {
            let reader = new ByteArrayReader([1, 2, 3, 4, 5])
            let buffer = reader.getBytes(2, 0)
            assert.deepEqual(buffer, Buffer.from([]))
        })
    })
})