import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Card, Alert, Button, Form, Row, Col, Input, DatePicker, Select, Upload, message, Tooltip } from 'antd';
import { PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
//"date format Library" Import 
import moment from 'moment'
import { DrawerContext } from '../../contexts/DrawerContext';
import { ConfigContext } from '../ConfigContext';
import { DetailsTableContext } from './DetailsTableContext';


export const FormTableContext = createContext();

const { Option } = Select;
const { TextArea } = Input;

const FormTableContextProvider=(props)=>{
    
    const { userId, otherFields, path, checkOp, opData, count, setCount, dateFormat, parseAttachName, reqProps, inFiles, reqFileCount, setFileCount}= useContext(ConfigContext);
    const {jobs, jobData, visible, auditOnly}=useContext(DrawerContext);    
    const [disabled, setDisabled]=useState(true);
    const [submitDisabled, setSubmitDisabled]=useState(true);
    const [uploadedFile, setUploadedFile]=useState(null);
    const [file, setFile] = useState([]); 
    const [fileDisplay,setFileDisplay]=useState(null);
    const [progress, setProgress] = useState(0);
    const [submitted,setSubmitted]=useState(false);
    //const [nameFields,setNameFields]=useState();
    const [formRowTitles, setFormTitles]=useState([ 
        {
            key:'Form1',
            section:'General Entry Details'
        },       
       
    ]);

    const [initialTitles, setFirstTitles]=useState(formRowTitles);

    //defines states for form validation
    const [validate, setValidate]= useState({
        nameValidate:"info",      
        dateValidate:"info"         
    });

    const [validationMsg, setValidationMsg]= useState(`${reqFileCount} expected BUT none attached`);
    const ogValidationMsg= validationMsg;
  
    
    const formRef = useRef(null);
    const el = useRef(); // accesing input element
    const fileForm= useRef();
    //form instance to access added form functionality-- See form.getFieldsValue & form.resetFields in CreateJobs.js 
    const [form] = Form.useForm();

    let fieldNames= [];  

    //defines the default value for "scheduled Date" form input as the current date
    const date= new Date(Date.now());
   
    let dummyFileContainer= file;
    //defines
    
    const validateMessages={
        required: '${label} is required!',
        types: {
            string: '${label} is invalid'
        }
    }
    const formProps={
        name:"jobForm",
        ref:formRef,
        form: form,       
        layout:"vertical",
        requiredMark:false,
        validateMessages: validateMessages,
        initialValues:{operationType:path[1], source:userId, schedule_date_time:moment(date, dateFormat) }
    
    };

  
    const delFile=(file)=> {
        console.log("The file being deleted is", file)
        setFile(prevFiles=>  prevFiles.filter(currentFile => currentFile !== file)); 
        dummyFileContainer= dummyFileContainer.filter(dummyFile=> dummyFile !== file);
        validationCases();
    }
   

    const validationCases=()=>{
        // if (!checkFileType()) {
        //     setValidationMsg("A file type is missing");           
        // }         
         if(dummyFileContainer.length!=reqFileCount){
            console.log("Number of inputs required", reqFileCount);
            setValidationMsg(`${reqFileCount} expected BUT ${dummyFileContainer.length} attached!`);             
        }
        else{
            setValidationMsg();
        }
    }
       
    //executed when an Upload event occurs in form to populate 'file' state with the data of that uploaded file
    const handleChange = (e) => {
        setProgress(0);        
        var files=e.target.files;
        console.log("The file is", files);

        var filesArr = Array.prototype.slice.call(files);
        console.log("The files are", filesArr);    

        dummyFileContainer.push(...filesArr);

        setFile(dummyFileContainer);  

        console.log("File Container", dummyFileContainer);
        if(file.length>0){                       
            validationCases();
        }
        else{
           
            validationCases();
        }
    }

    //controls formValidation before submission
    const validateField=async(key, value)=>{       
        if ((key.field==="name")) {
            //console.log("The jobs are", jobs)
            if (jobs.some(job=>job.name==value)){               
                return Promise.reject(new Error('A Job with this name already exists!'));
            }
                    
        }             
    }
   
   //sets the calendar dates which are unavailable to the user
    function invalidDate(current) {
        // Can not select days before today and today
        return current && current.valueOf() < Date.now();
    }

    const uniqueFieldRender=()=>{
        
        let fieldLabels=[];
        const propTypeRegX={
            "date":  /\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z/,
            "otherString":/[\w\s\w]*/
        }
        const uniqueFields= reqProps.map((field, index)=>{
            fieldNames.push(field.name);
            const fieldParse= field.name.split('_');
            const upCase= [];
            fieldParse.forEach(name => {
                upCase.push(name.replace(/^\w/, (match)=>match.toUpperCase()))
            });
            fieldLabels.push(upCase.join().replace(/,/g, " "));          
            // setNameFields(fieldNames);
            return(
                <Col key={`field-${index}`} md={12} xs={24}>                  
                    <Form.Item 
                        name={fieldNames[index]} 
                        label={fieldLabels[index]} 
                        rules={[{required:field.required},{validator:(key, value)=>validateField(key, value)}]}
                        hasFeedback >
                        {
                            (propTypeRegX.date.test(field.data_type))?
                                <DatePicker disabledDate={invalidDate} format={dateFormat} showTime />                            
                            :(Array.isArray(field.data_type))?
                                <Select>
                                    {field.data_type.map((type)=>{
                                        return(
                                            <Option key={`type-${index}`} value={`${type}_${index}`}>{type}</Option>   
                                        )
                                    })}                                   
                                             
                                </Select>
                            :  <Input placeholder={field.data_type}/>
                            
                        }
                    </Form.Item> 
                </Col>
            )
        })
        return uniqueFields
    }

    const formRowRender=(record)=>{
        if (record.section==="General Entry Details"){
            return(
                <Form {...formProps}>                    
                    <Row gutter={[100,35]}>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="operationType"
                                label="Operation Type">                               
                                <Input disabled={true}/>
                            </Form.Item>
                        </Col>
                       
                        <Col md={12} xs={24}>                        
                            <Form.Item 
                                name='name' 
                                label='Job Name'
                                rules={[{required:true},{validator:validateField}]}
                                hasFeedback>
                                <Input placeholder="Job x - disconnects"/>
                            </Form.Item>
                        </Col>

                        <Col md={12} xs={24}>                        
                            <Form.Item 
                                name='source' 
                                label='Source'>
                                <Input disabled={true}/>
                            </Form.Item>
                        </Col>

                                               
                        <Col md={12} xs={24}>
                            <Form.Item
                                id="datepicker" 
                                name='schedule_date_time'
                                label='Scheduled Date' 
                                rules={[{required:true},{validator:validateField}]}                               
                                hasFeedback
                               >                                    
                                <DatePicker disabledDate={invalidDate} format={dateFormat} showTime />                                    
                            </Form.Item>
                        </Col>                  
     
                        <Col md={12} xs={24}>
                            <Form.Item name="comments" label="Comments">
                                <Input.TextArea/>
                            </Form.Item>
                        </Col>
                        
                    </Row>
                </Form>
            ) 
        }
        else if(record.section==="Attachments"){
            console.log(inFiles);
            return (
                <div id="attachForm">
                    <Row gutter={80}> 
                        <Col span={14}>
                            <Row gutter={[1, 30]}> 
                                <form ref={fileForm}>     
                                    <label className="custom-file-upload">                           
                                        <input type='file' multiple name="attachment" ref={el} onChange={handleChange}/>
                                        <div id="buttonTitle"> Add File/s</div>
                                    </label>
                                </form>                                
                            </Row> 
                            <Row>
                            {validationMsg==null? <div/>:<Alert id="validationMsg" message={validationMsg} type="warning" showIcon />}
                              
                                {file.map((attachment, index, arr) => {
                                    
                                    if('attachment' in attachment){
                                        return(                                    
                                            <Card id="addedFile" key={`file-${index}`} size="small">
                                                <Row align="middle">
                                                    <Col span={20}>
                                                        <Row justify="center">                                                    
                                                            <div id="fileName">{parseAttachName(attachment.attachment.name)}</div>
                                                        </Row>     
                                                        <Row justify="center">
                                                            <div id="fileStat">Pre-existing File</div>
                                                        </Row>                                           
                                                    </Col>
                                                    <Col span={4}>
                                                    <Tooltip placement="right" title="Remove File">                                                
                                                        <Button id="fileDelButton" icon={<DeleteOutlined/>} onClick={()=>delFile(attachment)}/>                                                                     
                                                    </Tooltip>  
                                                    </Col>
                                                </Row>                                        
                                            </Card>
                                        )
                                    }
                                    else{
                                        return(
                                            <Card id="addedFile" key={`file-${index}`} size="small">
                                                <Row align="middle">
                                                    <Col span={20}>
                                                        <Row justify="center">                                                    
                                                            <div id="fileName">{attachment.name}</div>
                                                        </Row>  
                                                        {jobData!=null?
                                                            <Row justify="center">
                                                                <div id="fileStat">Newly Added File</div>
                                                            </Row>
                                                            :<div></div>
                                                        }                                              
                                                    </Col>
                                                    <Col span={4}>
                                                    <Tooltip placement="right" title="Remove File">                                                
                                                        <Button id="fileDelButton" icon={<DeleteOutlined/>} onClick={()=>delFile(attachment)}/>                                                                     
                                                    </Tooltip>  
                                                    </Col>
                                                </Row>                                        
                                            </Card>
                                        )
                                    }
                                })}
                            </Row>
                        </Col>                    
                     
                    </Row>                   
                </div>               
            )
        }
        else if(record.section==="Operation Specific Details"){
            return (
                <Form {...formProps}> 
                    <Row gutter={[100,35]}>
                        {uniqueFieldRender()}
                    </Row>                   
                </Form> 
            )
        }
    }

   
    useEffect(() => {
        setFormTitles(initialTitles);
        if(!auditOnly){
            checkOp().then((value)=>{                        
                console.log("Request Props", value)
                if(value.propTestString==true && count<1){
                    setFormTitles((prevTitles)=>[...prevTitles,{
                        key:'Form3',
                        section:'Operation Specific Details'
                    }])
                    setCount((count)=>count+1);
                }
                else if(value.propTestString==="fileOnly" && count<1){
                    setFormTitles((prevTitles)=>[...prevTitles,{
                        key:'Form2',
                        section:'Attachments'
                    }])
                    setCount((count)=>count+1);
                }
                else if(value.propTestString=="both" && count<1){
                    const bothFields=[{
                        key:'Form3',
                        section:'Operation Specific Details'
                    }, {
                        key:'Form2',
                        section:'Attachments'
                    }]; 
                    setFormTitles((prevTitles)=>[...prevTitles, ...bothFields])
                    setCount((count)=>count+1);
                }
                else{
                    setFormTitles(initialTitles);
                    setCount(0);
                }
    
                console.log("Job data to be modified:",jobData);
                form.resetFields();
                setFile([]);
                dummyFileContainer=[];
                setValidationMsg(`${value.fileLength} expected BUT none attached`);
                setFileCount(value.fileLength);
                       
                if(jobData!=null){
                    if (formRef.current) {
                        const jobDate= new Date(Date.parse(jobData.schedule_date_time))
                        form.setFieldsValue({
                            name: jobData.name,
                            source: userId,
                            schedule_date_time: moment(jobDate, dateFormat),
                            comments: jobData.comments
                        });
                        console.log("The props are", value.otherFields);
    
                        //if unique properties are defined in configuration
                        if (value.otherFields!=null){
                            let uniqueFields ={};
                            let otherFields=[];
                            value.otherFields.forEach((prop)=>{
                                otherFields.push(prop.name);
                            })
                            console.log(" are", otherFields);
    
                            //loop through the unique properties defined (in configurations) for an operations process and creates a form field for each
                            otherFields.forEach((name)=>{  
                                           
                                uniqueFields[name]=Object.values(jobData.uniqueFields.find((field)=> Object.keys(field)[0]===name))[0];
                                const regXDate= /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3})Z$/
    
                                //checks if unique property is of type date based on default value defined in configurations
                                if(name in uniqueFields && regXDate.test(uniqueFields[name])){
                                    uniqueFields[name]=moment(new Date(Date.parse(uniqueFields[name])), dateFormat);
                                }
                            })
                            console.log("The unique Fields are", uniqueFields);
                            form.setFieldsValue(uniqueFields);
                        }
                        
                        if(Array.isArray(jobData.requestAttachments.input) && 'requestAttachments' in jobData){                   
                            console.log("The required number of files is", value.fileLength)
                            setFile((prevFiles)=>[...prevFiles, ...jobData.requestAttachments.input]);
                            if(jobData.requestAttachments.input.length==value.fileLength){
                                
                                setValidationMsg(null);
                            }
                        
                        }
                    }
                }
            })  
        }
              
      
    }, [visible, jobData, formRef])
    
  
    return(
        <FormTableContext.Provider value={{ submitDisabled, fieldNames, validate,  validationMsg, dateFormat, setSubmitted, fileForm, form, formRowRender, formRowTitles, setValidate, disabled, file, setFile }}>
            {props.children}
        </FormTableContext.Provider>
    )
}

export default FormTableContextProvider