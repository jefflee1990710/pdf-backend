export default class Lexer {

    constructor(bufferStream){
        this.bufferStream = bufferStream
    }

    parse(...objClazzes){
        for(let i = 0 ; i < objClazzes.length; i ++){
            let Clazz = objClazzes[i]
            let pdfObject = new Clazz()
            let parseSuccess = pdfObject.fillBy(this.bufferStream)
            if(parseSuccess){
                return pdfObject
            }
        }
        return null
    }

}