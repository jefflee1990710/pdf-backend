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

export class Command extends FormattedObject {

    constructor(command){
        super()
        this.command = command
    }
 
    fillBy(bufferStream){
        bufferStream.savePosition()

        let byte;
        let cmd = Buffer.from(this.command, config.get("pdf.encoding"))
        let cnt = 0
        while(true){
            if(cnt > cmd.length - 1){
                bufferStream.rewindPosition()
                this._value = this.command
                return (this._filled = true)
            }
            if(byte !== cmd[cnt]){
                bufferStream.restorePosition()
                return (this._filled = false)
            }
            byte = bufferStream.getByte()
            cnt ++
        }
    }
}

export class XRef extends FormattedObject {

    fillBy(bufferStream){
        bufferStream.savePosition()
        
        let byte;
        do{
            byte = bufferStream.getByte()
        }while(helper.isLineBreak(byte) || helper.isTab(byte) || helper.isSpace(byte))

        let cmd = new Command("xref")
        let cmdFound = cmd.fillBy(bufferStream)

        if(!cmdFound){
            bufferStream.restorePosition()
            return (this._filled = false)
        }

        this._value = 123
        return (this._filled = true)

    }
}

export class Integer extends FormattedObject {

    fillBy(bufferStream){
        bufferStream.savePosition()

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
        // Only 0-9 characher is integer.
        while(true){ 
            if(helper.isNumber(byte)){ // 0-9
                baseValArr.push(byte)
            }else{
                bufferStream.rewindPosition()
                break;
            }
            byte = bufferStream.getByte()
            if(byte === null){
                break
            }
        }
        
        if(baseValArr.length === 0){
            bufferStream.restorePosition()
            return (this._filled = false)
        }

        let baseVal = Buffer.from(baseValArr).toString(config.get('pdf.encoding'))
        this._value = this.sign * parseInt(baseVal)
        return (this._filled = true)
    }

}
