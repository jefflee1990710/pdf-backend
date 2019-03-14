# PDF Structure Document

this is a API document for the object constructing the PDF's document structure.

- [PDFCatalog](#PDFCatalog)
- [PDFDocument](#PDFDocument)
- [PDFCatalog](#PDFCatalog)
- [PDFPage](#PDFPage)
- [PDFPages](#PDFPages)
- [PDFTrailer](#PDFTrailer)
- [PDFXRef](#PDFTrailer)
- [PDFXRefStream](#PDFXRefStream)
- [PDFXRefTable](#PDFXRefTable)

---
## PDFCatalog

---
## PDFDocument

- Get root PDFCatalog of the document
```javascript
PDFDocument.catalog
```

- Get json of pdf document
```javascript
PDFDocument.toJSON()
```

- Get start xref offset of pdf document
```javascript
PDFDocument.startXRefOffset
```

- Check if the pdf document is linearization
```javascript
PDFDocument.isLinearization
```

- ASll pdf document start with a xref offset read from the bottom of the pdf file
```javscript
PDFDocument.startXRefOffset
```

- Get all cross-reference from oldest to latest
```javscript
PDFDocument.getAllXRef() -> [PDFXRef]
```

- Get the accumulated cross-reference by all xRef
```javscript
PDFDocument.getMasterXRef() -> PDFXRef
```

---
### PDFCatalog

---
## PDFPage

---
## PDFPages

---
## PDFTrailer

---
## PDFXRef

- Search offset of a indirect object from beginning of the file by objectName and generationNumber
```
PDFXRef.searchOffsetRecord(objectNumber, generationNumber) -> UncompressedObjectOffsetRecord/CompressedObjectOffsetRecord/null
```

- Search offset of a indirect object from beginning of the file by object reference string
```
PDFXRef.searchOffsetRecordByReferenceString(objectReferenceStr) -> UncompressedObjectOffsetRecord/CompressedObjectOffsetRecord/null
```

- Offset of root object if exist
```
PDFXRef.rootObjectOffset
```

---
## PDFXRefStream

---
## PDFXRefTable

