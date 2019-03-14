
# PDF Common Object

## PDFObject

### All object which can parse from the stream reader is a PDFObject.

- pipe a stream to the object, the object will consume the stream from current position until it read the content it match and stop the pointer.
```javascript
PDFObject.pipe(stream)
```

- All class extends PDFObject should extend this method, so the object can parse to a JSON object
```javascript
PDFObject.toJSON()
```

---

## PDFArray
### 
- Retrieve array elements
```javascript
PDFArray.elements
```
---
## PDFBoolean

### Consume the keyword true or false.

- Get value of the boolean (true/false)
```javascript
PDFBoolean.value
```
---
## PDFCmd

- Get captured command string
```javascript
PDFCmd.cmd
```
---
## PDFDict

- Get value by field name
```javascript
PDFDict.set(fieldname, obj)
```

- Set value by field name
```javascript
PDFDict.get(fieldname)
```

- Get all fields
```javascript
PDFDict.fields
```
---
## PDFIndirectObject

- Override #receiveElement(element, index) if extends PDFIndirectObject
```javascript
receiveElement(element, index) {
    // Do something here
}
```

- Get all elements inside the indirect object
```javascript
PDFIndirectObject.elements
```
---
## PDFName

- Get value of the name as a string
```javascript
PDFName.value
```
---
## PDFObjectReference

- Get the object number as PDFReal of this object reference
```
PDFObjectReference.objectNumber
```

- Get the generation number as PDFReal of this object reference
```
PDFObjectReference.generationNumber
```

- Get a display string of object reference for example "1 0 R"
```
PDFObjectReference.toDisplayName()
```
---

## PDFOctal

### Consume octal character in string

---
## PDFReal

### Consume inetger or float value for example 123, 43445, +17, -98, 0, 34.5, -3.62, 4., -.002, 0.0

- Get the numberic value
```javascript
PDFReal.value
```