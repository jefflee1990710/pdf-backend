
import {inflateSync} from 'zlib';
import FilterPrediction from './FilterPrediction';

export default class FilterInflate {

    decode(buffer, params){
        let decodeBuffer = inflateSync(buffer);
        let prediction = new FilterPrediction();
        decodeBuffer = prediction.decode(decodeBuffer, params);
        return decodeBuffer;
    }

}