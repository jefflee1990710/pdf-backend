import helper from '../helper'

export default class FilterPrediction {

    async decode(buffer, params){
        let rows = []

        let colors = params.Colors || 1
        let bitsPerComponent = params.BitsPerComponent || 8
        let columns = params.Columns || 1
        var predictor = params.Predictor || 1

        if(predictor === 1){
            return buffer.slice()
        }else{
            let rowlength = helper.calculateRowSize(colors, bitsPerComponent, columns)
            let actline = Buffer.alloc(rowlength)
            let lastline = Buffer.alloc(rowlength)
    
            let endPos = buffer.length - 1
            let pos = 0
            let linepredictor = predictor
            while(pos <= endPos){
                if(predictor >= 10){
                    linepredictor = buffer[pos++]
                    if(linepredictor == -1){
                        throw new Error('Error line predictor when decoding predicted stream content.')
                    }
                    linepredictor += 10
                }
                for(let b = 0 ; b < rowlength; b++){
                    actline[b] = buffer[pos++]
                }
                let decodedline = decodePredictorRow(linepredictor, colors, bitsPerComponent, columns, actline, lastline)
                lastline = decodedline.slice()
                for(let b = 0 ; b < decodedline.length; b++){
                    rows.push(decodedline[b])
                }
            }
        }
        return Buffer.from(rows)
    }

}

function decodePredictorRow(predictor, colors, bitsPerComponent, columns, actline, lastline){

    let bitsPerPixel = colors * bitsPerComponent
    let bytesPerPixel = (bitsPerPixel + 7)/8
    let rowlength = actline.length
    let elements = columns * colors;
    let rb = Buffer.alloc(rowlength)

    switch(predictor){
        case 2:
            if (bitsPerComponent == 8){
                for (let p = bytesPerPixel; p < rowlength; p++){
                    let sub = actline[p] & 0xff;
                    let left = actline[p - bytesPerPixel] & 0xff;
                    rb[p] = (sub + left);
                }
                break;
            }
            if (bitsPerComponent == 16){
                for (let p = bytesPerPixel; p < rowlength; p += 2)
                {
                    let sub = ((actline[p] & 0xff) << 8) + (actline[p + 1] & 0xff);
                    let left = (((actline[p - bytesPerPixel] & 0xff) << 8)
                            + (actline[p - bytesPerPixel + 1] & 0xff));
                            rb[p] = (((sub + left) >> 8) & 0xff);
                    rb[p + 1] = ((sub + left) & 0xff);
                }
                break;
            }
            if (bitsPerComponent == 1 && colors == 1){
                for (let p = 0; p < rowlength; p++){
                    for (let bit = 7; bit >= 0; --bit){
                        let sub = (actline[p] >> bit) & 1;
                        if (p == 0 && bit == 7){
                            continue;
                        }
                        let left;
                        if (bit == 7){
                            left = actline[p - 1] & 1;
                        }else{
                            left = (actline[p] >> (bit + 1)) & 1;
                        }
                        if (((sub + left) & 1) == 0){
                            rb[p] = (actline[p] & ~(1 << bit));
                        }else{
                            rb[p] = (actline[p] | (1 << bit));
                        }
                    }
                }
                break;
            }
            // everything else, i.e. bpc 2 and 4, but has been tested for bpc 1 and 8 too
            for (let p = colors; p < elements; ++p)
            {
                let bytePosSub = p * bitsPerComponent / 8;
                let bitPosSub = 8 - p * bitsPerComponent % 8 - bitsPerComponent;
                let bytePosLeft = (p - colors) * bitsPerComponent / 8;
                let bitPosLeft = 8 - (p - colors) * bitsPerComponent % 8 - bitsPerComponent;

                let sub = helper.getBitSeq(actline[bytePosSub], bitPosSub, bitsPerComponent);
                let left = helper.getBitSeq(actline[bytePosLeft], bitPosLeft, bitsPerComponent);
                rb[bytePosSub] = helper.calcSetBitSeq(actline[bytePosSub], bitPosSub, bitsPerComponent, sub + left);
            }
            break;
        case 10:
            break;
        case 11: //SUB
            for(let b = bytesPerPixel ; b < rowlength; b++){
                let sub = actline[b]
                let left = actline[b - bytesPerPixel]
                rb[b] = sub + left
            }
            break;
        case 12: //UP
            for(let b = 0 ; b < rowlength; b++){
                let up = actline[b] & 0xff
                let prior = lastline[b] & 0xff
                rb[b] = (up + prior) & 0xff
            }
            break;
        case 13: // AVG
            for(let b = 0 ; b < rowlength; b++){
                let avg = actline[b] & 0xff
                let left = b - bytesPerPixel >= 0 ? actline[b - bytesPerPixel] & 0xff : 0
                let up = lastline[b] & 0xff
                rb[b] = (avg + (left + up)/2) & 0xff
            }
            break;
        case 14: // PAETH
            for(let p = 0 ; p < rowlength; p ++){
                let paeth = actline[p] & 0xff;
                let a = p - bytesPerPixel >= 0 ? actline[p - bytesPerPixel] & 0xff : 0;// left
                let b = lastline[p] & 0xff;// upper
                let c = p - bytesPerPixel >= 0 ? lastline[p - bytesPerPixel] & 0xff : 0;// upperleft
                let value = a + b - c;
                let absa = Math.abs(value - a);
                let absb = Math.abs(value - b);
                let absc = Math.abs(value - c);

                if (absa <= absb && absa <= absc){
                    rb[p] = ((paeth + a) & 0xff);
                }else if (absb <= absc){
                    rb[p] = ((paeth + b) & 0xff);
                }else{
                    rb[p] = ((paeth + c) & 0xff);
                }
            }
            break;
        default:
            break;
    }

    return rb
}
