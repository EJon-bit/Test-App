import { useContext, useEffect, useState, useRef } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';

//importing UI Library (Ant Design) Components
import { Col, Row, Button, Alert } from 'antd';

//importing context API components to access global/shared state variables
import { ConfigContext } from '../../contexts/ConfigContext';
import { DrawerContext } from '../../contexts/DrawerContext';
import { ThemeContext } from '../../contexts/ThemeContext';

//defines component that renders monaco editor for viewing/editing VAS Ops configurations 
const SettingsEditor=({change, data})=>{

    const { configFieldsVal, opData, prevPath, popLinksData, renderModal, setConfigVal, setPrevPath, setSettingType, userId }= useContext(ConfigContext);
    const { setVisible }=useContext(DrawerContext);
    const {theme}=useContext(ThemeContext);
    // const [editorTheme, setEditorTheme]=useState();
    const [buttonEnabled, setButton]= useState(true);
    //const [messages,setMessage]=useState(null);
    const [errorsRendered, setErrors]= useState();
    const editorRef = useRef(null);

 
    const handleEditorWillMount=(monaco)=>{
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            allowComments: true
        })
    }

    const handleEditorDidMount=(editor, monaco)=>{
        editorRef.current = editor; 
        setTimeout(()=>{
            editorRef.current.getAction('editor.action.formatDocument').run()
            editorRef.current.setScrollPosition({scrollTop: 0});
        }, 200)            
    }

   
    const parseEditorValue=()=>{
        let jsonToString= null;
        var operation=null;
            
        if(change==false){
            if(configFieldsVal!==null && 'operation' in configFieldsVal){
                console.log("Config Fields Val is", configFieldsVal.operation)
              
                var configData={
                    "name": configFieldsVal.operation.opName, 
                    "id":configFieldsVal.operation.opName.replace(/[A-Z]/g, (match, offset, string)=>{
                        return (offset > 0 ? '_' : '') + match.toLowerCase();
                      }),
                    "request_template":{
                        "request_statuses":{
                            "default":"place string here",
                            "statuses":["Array of strings here"]
                        }
                    },
                    "model":{
                        "type":"place string here",
                        "data":{
                            "host":"place ip address of server here"
                        }
                    }
                };
                console.log("the opData is", opData);

                configFieldsVal.operation.specialProps.forEach((prop)=>{
                    if(/File\sTransfers\s.*/.test(prop)){
                        operation= opData.find((op)=> 'file_transfers' in op.model.data)
                        configData.model.data.file_transfers= operation.model.data.file_transfers
                    }
                    else if(/Script\sExecution\s.*/.test(prop)){
                        operation= opData.find((op)=> 'script_execution' in op.model.data)
                        configData.model.data.script_execution= operation.model.data.script_execution
                    }
                    else if(/Attachments/.test(prop)){
                        operation= opData.find((op)=> 'request_attachments' in op.request_template)
                        configData.request_template.request_attachments= operation.request_template.request_attachments
                    }
                    else if(/Other\sUnique\sProperties/.test(prop)){
                        operation= opData.find((op)=> 'request_properties' in op.request_template);
                        configData.request_template.request_properties= operation.request_template.request_properties
                    }
                   
                })
               
               jsonToString = JSON.stringify(configData);
            }
            else if(configFieldsVal!==null && 'link' in configFieldsVal){
                console.log("Config Fields Val is", configFieldsVal.link.linkName)
                var link=null;
                var configData={
                    "name": `${configFieldsVal.link.linkName}`,
                    "link": "url for application",
                    "icon": "link to icon"
                }

                jsonToString = JSON.stringify(configData);
            }
            else{
                jsonToString = JSON.stringify(opData);               
            }
        }
        else if(change==true){
            jsonToString = JSON.stringify(popLinksData);
           
        }        
      
        return jsonToString
      
    }

    const validateEditorVal=(markers)=>{
        // console.log("Editor Markers", markers);
        const messages= [];
        if(markers.length){
            setButton(false);
            markers.forEach((marker)=>{
                messages.push(`${marker.message}. See lines ${marker.startLineNumber} to ${marker.endLineNumber}`);
               
                const errors= messages.map((message, index)=>{
                    return(
                        <Col span={24}>
                             <Row id="alert" key={`message-${index}`} justify="center">
                                <Alert 
                                message="Error"
                                description={message}
                                type="error"
                                showIcon
                                closable/>
                            </Row>
                        </Col>
                       
                    )
                }) 
                setErrors(errors);  
                editorRef.current.revealLine(marker.startLineNumber);
                
            })
            
        }
        else{
            setButton(true);
            setErrors();
        }
    }    

    const getTheme=()=>{
        console.log("The theme is", theme);
        if(theme==="dark-theme"){
            return 'dark'
        }
        else if(theme==="light-theme"){
            return 'light'
        } 
    }
   
    const diffEditorProps={
        height:"80vh",
        language:"json",
        original:"",
        modified:"",
        beforeMount: handleEditorWillMount,
        onMount: handleEditorDidMount,
        
    }
    const editorProps={
        height:"80vh",
        language:"json",
        value: parseEditorValue(),
        beforeMount: handleEditorWillMount,
        onMount: handleEditorDidMount,
        onValidate: validateEditorVal,
        theme: getTheme()
    }

      
    const updateOpSettings=async()=>{

        var putReqBody= await editorRef.current.getValue();
        
        const editedBody= JSON.parse(putReqBody);
        if(Array.isArray(editedBody)){
            editedBody.push({"userId": userId});        
        }
        else if(typeof editedBody === 'object'){
            editedBody.userId= userId
        }

        console.log("Edited Body is", editedBody);
       
      
        const requestOptions = {
            method: 'PUT',                      
            body: JSON.stringify(editedBody),
            headers: {
                'Content-Type': 'application/json'
            }
        };
                             
        const putReqPath= 'http://localhost:5000/settingOperation/updateSettings'

        fetch(putReqPath, requestOptions)
        .then(async response => {
            const res = await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (res && res.message) || response.status;
                return Promise.reject(error);
            }
            else{
                renderModal("success", 'PUT');                    
                setSettingType(null);
                setConfigVal(null);
                setPrevPath(!prevPath);   
                setVisible(false);           
                console.log("OP Settings Update response", res)
            }
        })
        .catch(error => {  
            setConfigVal(null);    
            renderModal("error", 'PUT')         
            console.error('There was an error!', error);
        });
    }
       
            
    return(
        <div>
            <Row>
                {change!=="compare"?
                    <Editor {...editorProps}/>
                    :<DiffEditor {...diffEditorProps}/>
                }
                
            </Row> 
            {errorsRendered}
            <Row justify="end">
                <Button id="saveButton" type="primary" disabled={!buttonEnabled} onClick={updateOpSettings}>
                    Save Change
                </Button> 
            </Row>   
        </div>
       
    )
    
 
}

export default SettingsEditor