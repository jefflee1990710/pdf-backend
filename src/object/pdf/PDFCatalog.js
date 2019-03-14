import PDFIndirectObject from '../PDFIndirectObject'
import { InvalidPDFFormatError } from '../../error';

export default class PDFCatalog extends PDFIndirectObject{

    constructor(config){
        super(config)
    }

    receiveElements(){}

    receiveElement(elem){
        if(elem.constructor.name !== "PDFDict"){
            throw new InvalidPDFFormatError('')
        }
        this.Type = elem.get('Type')
        this.Version = elem.get('Version')
        this.Extensions = elem.get('Extensions')
        this.Pages = elem.get('Pages')
        this.PageLabels = elem.get('PageLabels')
        this.Names = elem.get('Names')
        this.Dests = elem.get('Dests')
        this.ViewerPreferences = elem.get('ViewerPreferences')
        this.PageLayout = elem.get('PageLayout')
    }

    toJSON(){
        return {
            Type : this.Type ? this.Type.toJSON() : null,
            Version : this.Version ? this.Version.toJSON() : null,
            Extensions : this.Extensions ? this.Extensions.toJSON() : null,
            Pages : this.Pages ? this.Pages.toJSON() : null,
            PageLabels : this.PageLabels ? this.PageLabels.toJSON() : null,
            Names : this.Names ? this.Names.toJSON() : null,
            Dests : this.Dests ? this.Dests.toJSON() : null,
            ViewerPreferences : this.ViewerPreferences ? this.ViewerPreferences.toJSON() : null,
            PageLayout : this.PageLayout ? this.PageLayout.toJSON() : null
        }
    }

}