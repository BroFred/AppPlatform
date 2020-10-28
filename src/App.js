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

import schema from './schema/definition.json';
import tokenSchema from './schema/tokenSchema.json';
import uqlSchema from './schema/dataSourceSchema.json'


var ajv = new Ajv({allErrors: true, jsonPointers: true});
var validate = ajv.addSchema(tokenSchema).addSchema(uqlSchema).compile(schema);


function App() {
  const inputEl = useRef(null);
  const [dataInput, setdataInput] = useState(JSON.stringify({}));
  const [annotations, setAnnotations] = useState([]);
  function onChange(newValue) {
    setdataInput(newValue)
  }
  useEffect(() => {
    try {
      const { data, pointers } = jsonMap.parse(dataInput);
      var valid = validate(data);
      const errors = valid? [] : validate.errors
      console.log(errors)
      const additionalAnnotations = map(([key, val])=>{ 
        const {additionalProperty} = val.params;
        return { path: pointers[`${val.dataPath}${additionalProperty ? `/${additionalProperty}`: ''}`].key.line, message: val.message } 
      },toPairs(errors));
      const cunstomAnnotations = map((v)=>({
        row: v.path,
        column: 0,
        text: v.message,
        customized: true,
        type:'error'
      }), additionalAnnotations);
      const workerAnnotation = dropWhile(({customized})=>customized, annotations);
      inputEl.current.editor.getSession().setAnnotations([...cunstomAnnotations, ...workerAnnotation])
    } catch (error) {
      
    }
  }, [ dataInput, JSON.stringify(annotations) ])
  
  return (
    <AceEditor
    ref={inputEl}
    mode="json"
    theme="terminal"
    onChange={onChange}
    onValidate={setAnnotations}
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
