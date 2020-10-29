import "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/webpack-resolver";
import AceEditor from "react-ace";
import {useRef, useEffect, useState } from 'react';
import Ajv from 'ajv';
import { toPairs, map, dropWhile } from 'ramda';
import jsonMap from 'json-source-map';
import ajvErrors from 'ajv-errors';

// import validation schema
import sample from './schema/sample.json';
import schema from './schema/definition.json';
import tokenSchema from './schema/tokenSchema.json';
import dataSourceSchema from './schema/dataSourceSchema.json'
import vizSchema from './schema/vizSchema.json'
import formSchema from './schema/formSchema.json'
import layoutSchema from './schema/layoutSchema.json'

const ajv = new Ajv({allErrors: true, jsonPointers: true});
ajvErrors(ajv)
const validate = ajv
.addSchema(tokenSchema)
.addSchema(dataSourceSchema)
.addSchema(vizSchema)
.addSchema(formSchema)
.addSchema(layoutSchema)
.compile(schema);


function App() {
  const inputEl = useRef(null);
  const [dataInput, setdataInput] = useState(JSON.stringify(sample, null, 2));
  const [annotationString, setannotationString] = useState("[]");
  const onChange = (newValue) => {
    setdataInput(newValue)
  }
  useEffect(() => {
    try {
      const { data, pointers } = jsonMap.parse(dataInput);
      var valid = validate(data);
      const errors = valid? [] : validate.errors;
      const additionalAnnotations = map(([key, val])=>{ 
        const {additionalProperty} = val.params;
        return { path: pointers[`${val.dataPath}${additionalProperty ? `/${additionalProperty}`: ''}`].value.line, message: val.message } 
      },toPairs(errors));
      const cunstomAnnotations = map((v)=>({
        row: v.path,
        column: 0,
        text: v.message,
        customized: true,
        type:'error'
      }), additionalAnnotations);
      const workerAnnotation = dropWhile(({customized})=>customized, JSON.parse(annotationString));
      inputEl.current.editor.getSession().setAnnotations([...cunstomAnnotations, ...workerAnnotation])
    } catch (error) {
      
    }
  }, [ dataInput, annotationString ])
  
  return (
    <AceEditor
      ref={inputEl}
      mode="json"
      theme="terminal"
      onChange={onChange}
      onValidate={(anno)=>{setannotationString(JSON.stringify(anno))}}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={dataInput}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  );
}

export default App;
