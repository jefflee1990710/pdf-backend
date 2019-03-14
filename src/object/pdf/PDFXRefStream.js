import PDFIndirectObject from "../PDFIndirectObject";
import FilterChain from '../../filter/FilterChain'

import constant from '../../constant'
import logger from '../../logger'

export default class PDFXRefStream extends PDFIndirectObject{

    constructor(config){
        super(config)
    }

    receiveElement(element, index){
        switch(index){
            case 0:
                this.dict = element
                break;
            case 1:
                this.buffer = element.buffer
                break;
        }
    }

    get decodedBuffer(){
        
    }

    get filters(){
        let Filters = this.dict.get('Filter')
        let filtersList = []
        if(Filters.constructor.name === 'PDFArray'){
            for(let i in Filters.elements){
                let filter = Filters.elements[i]
                filtersList.push(filter.value)
            }
        }else{
            filtersList.push(Filters.value)
        }
        filtersList = filtersList.map(r => new constant.filterNames[r]())
        return filtersList
    }

    getFilterChain(){
        let filters = this.filters;
        let chain = new FilterChain(filters)
        return chain
    }

    

}