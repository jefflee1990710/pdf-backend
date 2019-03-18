import PDFObject from "../PDFObject";
import PDFCmd from "../PDFCmd";
import PDFAnd from "../condition/PDFAnd";
import PDFReal from "../PDFReal";
import PDFOr from "../condition/PDFOr";
import PDFSpace from "../PDFSpace";
import PDFLineBreak from "../PDFLineBreak";
import { UncompressedObjectOffsetRecord } from "./PDFXRef";

export default class PDFXRefTable extends PDFObject {

    constructor(config){
        super(config);
    }

    get objectTable(){
        let table = [];
        let startObjectNumber = 0;
        let started = false;
        for(let r in this.rows){
            let row = this.rows[r];
            if(row.constructor.name === 'PDFXrefTableSectionHeader'){
                started = true;
                startObjectNumber = row.get('startObjectNumber').value;
            }else{
                if(started){
                    if(row.get('flag').hit.cmd === 'n'){
                        table.push(new UncompressedObjectOffsetRecord(
                            startObjectNumber, 
                            row.get('generationNumber').value, 
                            row.get('objectOffset').value));
                    }
                    startObjectNumber ++;
                }
            }
        }
        return table;
    }

    pipe(stream){
        let addr = stream.savePosition();
        let start = stream.position;

        if(!new PDFCmd('xref').pipe(stream)){
            stream.restorePosition(addr);
            return null;
        }

        let rows = [];

        while(true){

            new PDFSpace().pipe(stream);

            let header = new PDFXrefTableSectionHeader();
            let headerResult = header.pipe(stream);
            if(headerResult){
                rows.push(header);
                continue;
            }

            let entry = new PDFXrefTableSectionEntry();
            let entryResult = entry.pipe(stream);
            if(entryResult){
                rows.push(entry);
                continue;
            }

            stream.cleanPosition(addr);
            this.rows = rows;
            this.filled = true;
            return this.pos = {
                start, length : (stream.position - start)
            };

        }
    }

    toJSON(){
        return {
            rows : this.rows.map(r => r.toJSON()),
            objectTable : this.objectTable
        };
    }
}

class PDFXrefTableSectionHeader extends PDFAnd {

    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFReal({name : 'startObjectNumber'}),
            new PDFCmd(" "),
            new PDFReal({name : 'numberOfObject'}),
            new PDFLineBreak()
        ];
    }

}

class PDFXrefTableSectionEntry extends PDFAnd {

    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFReal({name : "objectOffset"}),
            new PDFCmd(" "),
            new PDFReal({name : "generationNumber"}),
            new PDFCmd(" "),
            new PDFXrefTableSectionEntryFlag({name : "flag"}),
            new PDFLineBreak()
        ];
    }
}

class PDFXrefTableSectionEntryFlag extends PDFOr {
    constructor(config){
        super(config);
    }

    in(){
        return [
            new PDFCmd('f'),
            new PDFCmd('n')
        ];
    }
}