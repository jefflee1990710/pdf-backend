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
## PDFDocument

- Get root PDFCatalog of the document
```javascript
PDFDocument.catalog
```

- Get json of pdf document
```javascript
PDFDocument.toJSON()
```

- Check if the pdf document is linearization
```javascript
PDFDocument.isLinearization
```

- Get all cross-reference from oldest to latest
```javscript
PDFDocument.allXRef -> [PDFXRef]
```

- Get the accumulated cross-reference by all incremental xRef
```javscript
PDFDocument.xRef -> PDFXRef
```

---
## PDFCatalog

-- Version - the version of PDF specification to which the document conforms.
```javascript
PDFCatalog.Version
```

-- Extensions
```javascript
PDFCatalog.Extensions
```

-- Pages
```javascript
PDFCatalog.Pages
```

-- PageLabels
```javascript
PDFCatalog.PageLabels
```

-- Names
```javascript
PDFCatalog.Names
```

-- Dests
```javascript
PDFCatalog.Dests
```

-- ViewerPreferences
```javascript
PDFCatalog.ViewerPreferences
```

-- PageLayout
```javascript
PDFCatalog.PageLayout
```

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

- Get all cross-reference table in the PDF
```
PDFXRef.allXRef
```

- Get summarlized cross-reference table in the PDF
```
PDFXRef.xRef
```

- Get PDF's catalog
```
PDFXRef.catalog
```

---
## PDFXRefStream

- Get the 

---
## PDFXRefTable

