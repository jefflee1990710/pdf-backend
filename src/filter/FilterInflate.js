
import {inflate} from 'zlib'
import FilterPrediction from './FilterPrediction';

export default class FilterInflate {

    async decode(buffer, params){
        let decodeBuffer = await this._zlibDecode(buffer)
        let prediction = new FilterPrediction()
        decodeBuffer = prediction.decode(decodeBuffer, params)
        return decodeBuffer
    }

    _zlibDecode(ib){
        return new Promise((resolve, reject) => {
            inflate(ib, (err, result) => {
                if(err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
        });
    }

}