//React native Import
import { useContext, useState } from 'react';
//css Imports

//import '../../scss/formTable.css'

//UI Library (Ant Design) Components Import
import { Tag, Form, Row, Col, Input, Select, Button, Table, Modal } from 'antd';


//component Import
import { ConfigContext } from '../../contexts/ConfigContext';
import { ExpandableTableContext } from '../../contexts/ExpandableTableContext';
import { FormTableContext } from '../../contexts/TableSubContexts/FormTableContext';
import { DrawerContext } from '../../contexts/DrawerContext';



//renders form to make/schedule a job request or to create an operation instance.
const CreateRequest=({reqType})=>{
    
    //defines the sections of the "Create Job" Form
    const {data, expandedRowRender, expandIcon, expandRowByClick, defaultExpandedRowKeys}=useContext(ExpandableTableContext)
    const {submitDisabled, fieldNames, validationMsg, formRowTitles, validate, form, setFile, file, setSubmitted}= useContext(FormTableContext);
    const { renderModal, userId }=useContext(ConfigContext);
    const {jobData, setVisible}=useContext(DrawerContext); 
   
    const [modalProps, setModalProps]=useState();
    const [loading, setLoading]=useState(false);
    const [submitErrorMsg, setErrorMsg]= useState(null);
    //const history=useHistory();

    //defines the header for the form table
    const columns = [
        { title: 'Job Entry Form', dataIndex: 'section', key: 'sections' }
    ]   
           
    //function to make post request to save data from the form to a db
    const submitForm=()=>{  
        // const util = require('util');
       
        const formBody = new FormData();
        const uniqueFields=[];
        //console.log("Fields", form.getFieldsValue());
        //console.log("The field Names are", fieldNames)
        form.validateFields().then(()=>{
            console.log("form is Valid")
            if(formRowTitles.some((titles)=>Object.values(titles).includes('Attachments')) && validationMsg!=null){               
                throw  new Error("Missing Attachments")
            }
            else{
                setLoading(true);
                for (const [key, value] of Object.entries(form.getFieldsValue())){
                        
                    if(key!=="attachment" && !(fieldNames.includes(key))){
                        formBody.append(key, value);
                        console.log("The key is", key);
                    }
                    else if(fieldNames.includes(key)){
                        let obj={};
                        if(value!= undefined){
                            obj[key]= value;
                        }
                        else{
                            obj[key]= null;
                        }
                        uniqueFields.push(obj);
                    }      
                      
                }
                if(uniqueFields.length!=0){
                    formBody.append('uniqueFields', JSON.stringify(uniqueFields));
                }
                       
                if(file.length>1){
                    for(let i=0; i<file.length; i++){
                        console.log("The file is", file[i]);
                        if (typeof file[i].name == 'string'){                   
                            formBody.append('attachment', file[i]);
                        }
                        else{
                            formBody.append('attachment',JSON.stringify(file[i]));
                        }
                                      
                    }
                }
                else if(file.length==1){
                    console.log("The single file is", file[0]);
                    if (typeof file[0].name == 'string'){                   
                        formBody.append('attachment', file[0]);
                    }
                    else{
                        formBody.append('attachment',JSON.stringify(file[0]));
                    }
                   
                }
              
              
                for(var pair of formBody.entries()) {
                    console.log(pair[0]+ ', '+ pair[1]);
                }
                 
                const fetchReq=(url, reqType, headers)=>{            
                  
                    const requestOptions={
                        method: reqType,                      
                        body: formBody,
                        headers: headers==null? new Headers({}) : headers
                    } 
                                       
                    fetch(url, requestOptions)
                    .then(async response => {
                        const data = await response.json();
                        setSubmitted(true);
                        // check for error response
                        if (!response.ok) {
                            // get error message from body or default to response status
                            const error = (data && data.message) || response.status;
                            return Promise.reject(error);
                        }
                        else{  
                            setLoading(false);                  
                            renderModal("success", reqType);                  
                            setVisible(false);
                            setFile([]);                    
                            console.log(data)
                        }
                    })
                    .catch(error => {   
                        setLoading(false);    
                        renderModal("error", reqType);        
                        console.error('There was an error!', error);
                    });
                }
        
                if(reqType!=="post"){
                    fetchReq(`http://localhost:5000/itemOperation/${jobData.id}`, 'PUT', null)
                }
                else if(reqType=="post"){      
                    console.log("Post Request has been made");
                    
                    fetchReq('http://localhost:5000/itemOperation/addItem', 'POST', null );
                }
                            
            }        
        })
        .catch((error)=>{
            console.log(error)
            if(typeof error !== 'string' && validationMsg==null){
                form.scrollToField(error.errorFields[0].name[0]);
                setErrorMsg("Unable to Submit --- Incomplete fields");
            }
            else{
                setErrorMsg("Unable to Submit --- Missing Attachments");
            }
           
        })
    }

  
  
    return(
        <div id="jobCreate">
            <Row>
                <Col span={24}>
                    <div id="formTable">
                        {/* Wraps job/item entry form and compartmentalizes it into expandable rows*/}
                        <Table                            
                            className="components-table-demo-nested"
                            columns={columns}
                            expandable={{ defaultExpandedRowKeys, expandRowByClick, expandedRowRender, expandIcon }}
                            dataSource={data("Form")}
                            pagination={false}/>  
                    </div>                                 
                </Col>             
            </Row>            
            <br/>                     
            <Row align="middle" >
                <Col span={5}>
                    <Button id="submitButton" type="primary" loading={loading} htmlType="Submit" onClick={submitForm}>
                        Submit
                    </Button>                                                                  
                </Col>
                <Col offset={2} span={13}>
                    {
                        submitErrorMsg!=null?
                        <Tag id="errorMsg" color="red">{submitErrorMsg}</Tag>:null
                    }   
                </Col>
            </Row>       
        </div>
    );
}


export default CreateRequest;