import {FormattedObjectNotFillError} from './error'
import config from 'config'
import helper from './helper'

export class FormattedObject {

    get value(){
        if(this._filled){
            return this._value
        }else{
            throw new FormattedObjectNotFillError("Trying to retrive value before filled by buffer stream")
        }
    }
    
}

export class Integer extends FormattedObject {

    fillBy(bufferStream){
        let startPos = bufferStream.position

        this.sign = 1
        let byte = null
        do {
            byte = bufferStream.getByte()
        }while(helper.isLineBreak(byte) || helper.isTab(byte) || helper.isSpace(byte)) // Skip all space, tab or linebreak before

        if(byte === 0x2D){ // - sign
            this.sign = -1
            byte = bufferStream.getByte()
        }else if (byte === 0x2B){ // + sign
            this.sign = 1
            byte = bufferStream.getByte()
        }
        
        let baseValArr = []
        let reachEndOfStream = false
        // Only 0-9 characher is integer.
        while(helper.isNumber(byte) && !reachEndOfStream){ // 0-9
            baseValArr.push(byte)
            byte = bufferStream.getByte()
            if(byte === null){
                reachEndOfStream = true
            }
        }
        // Rewind one step backward for the position.
        // Because the filling process end by not integer character, so this consumed byte belong to next object.
        // Rewind it so the next filling is abe to read it.
        if(!reachEndOfStream){
            bufferStream.rewindPosition()
        }

        if(baseValArr.length === 0){
            this._filled = false
            bufferStream.position = startPos;
            return this._filled
        }

        let baseVal = Buffer.from(baseValArr).toString(config.get('pdf.encoding'))
        this._filled = true
        this._value = this.sign * parseInt(baseVal)
        return this._filled
    }

}
