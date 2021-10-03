//React native imports
import { useContext, useState } from 'react';

//css imports

// import '../scss/PagesCss/Config.css'

//UI Library (Ant Design) Components import
import { AuditOutlined, FolderOpenOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Icon, Popconfirm, Button, Row, Col, Card, Input, Form, Tooltip, Select, Tag, Divider} from 'antd';

//custom components import
import { ConfigContext } from '../contexts/ConfigContext';
import CustomDrawer from '../pageComponents/Global/Drawer'
import { DrawerContext } from '../contexts/DrawerContext';
import CustomModal from '../pageComponents/Global/CustomModal';
import GeneralAudits from '../pageComponents/Audit Logs/GeneralAudits';

const {Option}= Select;

//allows user to flexibility to define new operations and links to external Web Apps, modify/delete existing ones for the app to provide functionality for 
const Configurations=()=>{
    
    const { drawerWidth, navDrawer,showDrawer}=useContext(DrawerContext);
    const { breakPoint, setModalVisible, configFieldsVal, renderModal, path, prevPath, setSettingType, dummyVal, form, setConfigVal, setPrevPath}= useContext(ConfigContext);

    const [value, setValue] = useState();
    const [opEnabled, setOpEnabled]=useState({
        "Operation":{
            "add": false,
            "edit": false,
            "delete":false
        },
        "Link":{
            "add": false,
            "edit": false,
            "delete":false
        },
        "Model":{
            "add": false,
            "edit": false,
            "delete":false
        }
    });
    const [linkEnabled, setLinkEnabled]=useState(false);
    const [modelEnabled, setModelEnabled]=useState(false);
    const [fieldValue, setFieldValue]= useState(dummyVal);   
    const [addedValue, setAddedValue]= useState({
        "Operation":null,
        "Link":null,
        "Model":null
    });
    const [confirmLoading, setConfirmLoading]= useState(false);
    const [delVisible, setDelVis]=useState({
        "Operation":false,
        "Link":false,
        "Model":false
    });
      
    const options = [{ label: 'Attachments', value: 'gold' }, {label: 'Other Unique Properties', value: 'lime' }, { label: 'File Transfers (SFTP)', value: 'green' }, { label: 'Script Execution (SSH)', value: 'cyan' }];

    var index = 0;
  
   
    const handleCancel=(type)=>{
        setConfirmLoading(false); 
        setDelVis({...delVisible, [`${type}`]:false});             
    }

    const deleteConfigRequest=(type)=>{     
          
        setConfirmLoading(true);
        console.log("Thing being deleted", configFieldsVal);
        
        const requestOptions = {
            method: 'PUT',                      
            body: JSON.stringify(configFieldsVal),
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
                form.resetFields();   
                setOpEnabled({...opEnabled, [`${type}`]:{"add": false, "edit": false, "delete": false}});
                renderModal("success", 'PUT');   
                setConfirmLoading(false); 
                setDelVis({...delVisible, [`${type}`]: false});                 
                setSettingType(null);               
                setPrevPath(!prevPath);  
                console.log("OP Settings Update response", res);
                setConfigVal(null);
            }
        })
        .catch(error => {  
            form.resetFields();   
            setOpEnabled({...opEnabled, [`${type}`]:{"add": false, "edit": false, "delete": false}});
            setConfirmLoading(false); 
            setDelVis({...delVisible, [`${type}`]: false});  
            setConfigVal(null);    
            renderModal("error", 'PUT')         
            console.error('There was an error!', error);
        });
    }
    
    const configParse=(action, type)=>{
        console.log("the type is", type);        
        var fieldVal= null;

        if(type==="Operation"){            
            fieldVal= form.getFieldsValue(['opName']);  
            if(action==="Add"){
                fieldVal.specialProps= value;
                console.log("Form vals are", fieldVal);
                setConfigVal({"operation":fieldVal});               
            }    
            else if(action==="Edit"){
                setSettingType(fieldVal.opName);
                setPrevPath(!prevPath);                
                console.log("action define", fieldVal.opName)                
            }     
            else if(action==="Del"){
                console.log("Te field value is", fieldVal);
                setDelVis({...delVisible, [`${type}`]:true});
                setConfigVal(fieldVal);  
            } 
        }
        else if(type==="Link"){
            fieldVal= form.getFieldsValue(['linkName']);
            if(action==="Add"){              
                setConfigVal({"link":fieldVal});               
            }    
            else if(action==="Edit"){
                setPrevPath(!prevPath)
                setSettingType({"link": Object.values(fieldVal)[0]});
            }
            else if(action==="Del"){
                setDelVis({...delVisible, [`${type}`]: true});
                setConfigVal(fieldVal);  
            } 
        }
        if(action!=="Del"){
            showDrawer(`${action} ${type}`, "Configs");
            form.resetFields();   
            setOpEnabled({...opEnabled, [`${type}`]:{"add": false, "edit": false, "delete": false}});
        }
            
    }
    
    const formProps=[       
        {
            name:"opForm",
            form: form,       
            layout:"vertical",
            requiredMark:false
        },
        {
            name:"popLinkForm",
            form: form,       
            layout:"vertical",
            requiredMark:false
        }
    ]

    const renderButtons=(type, tipTitle)=>{
        return(
            <div id="configButtons">
                 <div id="opsButton">
                    <Tooltip placement="right" title={`All ${tipTitle}s`}>                   
                            <Button id="button" type="primary" icon={<FolderOpenOutlined/>} onClick={()=>showDrawer(`Add/Edit/Del ${type}s`, null)}/>                                                  
                    </Tooltip> 
                 </div>
                          
                <div id="opsButton"> 
                    <Tooltip placement="right" title={opEnabled[`${tipTitle}`].add? `Add ${tipTitle}`: `Enter New ${tipTitle} Name and/or Select Special Properties to Add`}>                                                                    
                            <Button id="button" type="primary" icon={<PlusOutlined/>} disabled={!opEnabled[`${tipTitle}`].add} onClick={()=>{configParse("Add", type)}}/>                      
                    </Tooltip>
                </div>
                
                <div id="opsButton"> 
                    <Tooltip placement="right" title={opEnabled[`${tipTitle}`].edit? `Edit ${tipTitle}`: `Enter ${tipTitle} Name to enable Editing`}>                                                                    
                            <Button id="button" type="primary" icon={<EditOutlined/>} disabled={!opEnabled[`${tipTitle}`].edit} onClick={()=>{configParse("Edit", type)}}/>                      
                    </Tooltip>
                </div>
                <div id="opsButton"> 
                    <Tooltip placement="right" title={opEnabled[`${tipTitle}`].delete? `Remove ${tipTitle}`: `Enter ${tipTitle} Name to enable Removal`}>
                        <Popconfirm 
                            id="popConfirm"
                            title="Are you Sure?"
                            placement="right"
                            visible={delVisible[`${tipTitle}`]}
                            onConfirm={()=>deleteConfigRequest(type)}
                            okButtonProps={{ loading: confirmLoading }}
                            onCancel={()=>handleCancel(tipTitle)}>                                                                  
                            <Button id="button" type="primary" icon={<DeleteOutlined/>} disabled={!opEnabled[`${tipTitle}`].delete} onClick={()=>{configParse("Del", type)}}/>                      
                        </Popconfirm>
                    </Tooltip>
                </div>
            </div>       
        )
    }
     
    const validateField=(key, value, configType)=>{
        console.log("The value is", value);
        console.log("The field is", key.field);
       // const propFieldFind= 
        if (value.match(/\w/)) {    
            console.log("field val length", fieldValue[`${configType}`].length)
            console.log("dummy val length", dummyVal[`${configType}`].length)
            console.log("Last value is", fieldValue[`${configType}`][fieldValue[`${configType}`].length-1])        
            if((fieldValue[`${configType}`].length > dummyVal[`${configType}`].length) && (value===fieldValue[`${configType}`][fieldValue[`${configType}`].length-1])){
                console.log("Add");
                setOpEnabled({...opEnabled, [`${configType}`]:{"add": true, "edit": false, "delete": false}});  
            }  
            else{
                console.log("Edit");
                setOpEnabled({...opEnabled, [`${configType}`]:{ "add": false, "edit": true, "delete":true }})
            }       
            return Promise.resolve('Success');           
        }
        else{
            return Promise.reject("Operation Name is required");
        }  
    }

    const tagRender=(props)=>{
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = event => {
          event.preventDefault();
          event.stopPropagation();
        };
        return (
          <Tag
            color={value}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
          >
            {label}
          </Tag>
        );
    }

    const onNameChange = (event, nameType) => {
        setAddedValue({...addedValue, [`${nameType}`]:event.target.value});
    };
    
    const addItem = (nameType) => {      
        console.log('addItem');            
        setFieldValue({...fieldValue, [`${nameType}`]:[...fieldValue[`${nameType}`], addedValue[`${nameType}`] || `New item ${index++}`]});
        setAddedValue({...addedValue, [`${nameType}`]:null});
    };

    const nameFieldRender=(nameType)=>{
        return(
            <Select
                value                    
                placeholder= {`Add and/or Select ${nameType} from Dropdown`}
                dropdownRender={menu => (
                    <div>
                        {menu}
                        <Divider style={{ margin: '4px 0' }} />
                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                            <Input style={{ flex: 'auto' }} value={addedValue[`${nameType}`]} onChange={(event)=>onNameChange(event, nameType)} />
                                <a
                                    style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                    onClick={()=>addItem(`${nameType}`)}
                                >
                                    <PlusOutlined /> Add item
                                </a>
                        </div>
                    </div>
                )}
            >
                {fieldValue[`${nameType}`].map(item => (
                    <Option key={item}>{item}</Option>
                ))}
            </Select>
            )
    }
    
    const tagChange=(value, option)=>{
        var tagLabels=[]
        option.forEach(tag => {
            tagLabels.push(tag.label)
        });
       setValue(tagLabels);
    } 

           
    return(
        <div id="config">
            
            {   !navDrawer?
                    <CustomDrawer drawerWidth={drawerWidth.settingsDrawer} placement="right"/> 
                :null  
            }    
           
            <Row gutter={[50, 20]}>
                <Col lg={12} xs={24}>                   
                    <Card title="Operations Configuration">
                        <Row gutter={5}>
                            <Col lg={17} md={18} xs={16} >
                                <Form {...formProps[0]}>                                        
                                    <Form.Item  
                                        name='opName' 
                                        label='Operation Name'
                                        rules={[{required:true},{validator:(key, value)=>validateField(key, value, "Operation")}]}
                                        hasFeedback>
                                        {nameFieldRender("Operation")}
                                    </Form.Item>

                                    <Form.Item 
                                        name='specialProps' 
                                        label='Special Properties'>
                                        <Select
                                            mode="multiple"
                                            showArrow
                                            tagRender={tagRender}                                           
                                            style={{ width: '100%' }}
                                            placeholder='Select Desired Properties'
                                            options={options}
                                            onChange={tagChange}
                                        />
                                    </Form.Item>
                                </Form> 
                                {
                                    opEnabled.Operation.edit && (breakPoint!=="sm" && breakPoint!=="xs")? 
                                        <Tag color="volcano">
                                            <a id="itemLogsLink" onClick={()=>setModalVisible(true)}>                                      
                                                <Icon id="auditIcon" component={AuditOutlined}/>
                                                See All Audit Logs
                                            </a>
                                        </Tag> : null
                                }
                                <CustomModal title={`Audit Logs for ${form.getFieldsValue(['opName']).opName}`} modalText={<GeneralAudits/>}/> 
                            </Col>
                            <Col offset={2} lg={5}  md={4} xs={6}>
                                {renderButtons("Operation", "Operation")}            
                            </Col>                                                 
                        </Row>                                       
                    </Card>
                </Col>

                <Col lg={12} xs={24}>                   
                    <Card title="Popular Links Configuration">
                        <Row>
                            <Col lg={17} md={18} xs={16} >
                                <Form {...formProps[1]}>                                        
                                    <Form.Item 
                                        name='linkName' 
                                        label='Link Name'
                                        rules={[{required:true},{validator:(key, value)=>validateField(key, value, "Link")}]}
                                        hasFeedback>
                                        {nameFieldRender("Link")}
                                    </Form.Item>
                                </Form>
                            </Col>       
                            <Col offset={2} lg={5}  md={4} xs={6}>
                                {renderButtons("Link", "Link")}                                                             
                            </Col>                          
                        </Row>
                                               
                    </Card>
                </Col>

                <Col span={24}>                   
                    <Card title="Model Configuration">                        
                        <Row>
                            <Col lg={17} md={18} xs={16} >
                                <Form layout="vertical" icon={<PlusOutlined/>} requiredMark={'hidden'} onValuesChange={"nothing"}>                                        
                                    <Form.Item 
                                        name='modelName' 
                                        label='Model Name'
                                        hasFeedback>
                                        {nameFieldRender("Model")}
                                    </Form.Item>
                                </Form>
                            </Col>
                            <Col offset={2} lg={5}  md={4} xs={6}>                                            
                                {renderButtons("Model", "Model")}
                            </Col>                          
                        </Row>                                                  
                    </Card>
                </Col>
               
            </Row>                
        </div>
    );
    
}

export default Configurations;

Configurations.auth=true;