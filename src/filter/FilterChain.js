import Filter from "./Filter";

export default class FilterChain extends Filter{

    constructor(filters){
        super();
        this.filters = filters;
    }

    decode(buffer, params){
        params = params || {};
        let cachedBuffer = buffer;
        for(let i in this.filters){
            let filter = this.filters[i];
            cachedBuffer = filter.decode(cachedBuffer, params);
        }
        return cachedBuffer;
    }

}