import { createContext, useRef, useState } from 'react'

import { Button, Form, Row, Col, Input, Select, message, Card, Tooltip } from 'antd';


export const ConfigFormContext = createContext();

const { Option } = Select;
const { TextArea } = Input;

const ConfigFormContextProvider=(props)=>{
    const [form] = Form.useForm();

    const [validate, setValidate]= useState({
        opNameVal:"info",
        modNameVal:"info"
                
    });

    const validateField=(key, value)=>{
        console.log("The value is", value);
        if ((key.field==="opName" || key.field==="modName") && value.match(/\w/)) {
            
            if (key.field==="opName"){
                setValidate({});
            }
            else if(key.field==="modName"){
                setValidate({});
            }
            return Promise.resolve('Success');
           
        }      
        else{
            if (key.field==="opName"){
                setValidate({});
            }
            else if(key.field==="modName"){
                setValidate({});
            }
           
            return Promise.reject();
           
        }      
                
    }

    const formRowRender=()=>{
        return(
            <div>
                <Row gutter={[50, 20]}>
                    <Col span={12}>                   
                        <Card title="Operations Configuration">
                            <Row gutter={8}>
                                <Col span={14}>
                                    <Form {...formProps[0]}>                                        
                                        <Form.Item 
                                            name='opName' 
                                            label='Operation Name'
                                            rules={[{required:true},{validator:validateField}]}
                                            hasFeedback>
                                            <Input placeholder="Sub disconnects" />
                                        </Form.Item>
                                        <Form.Item 
                                            name='modName' 
                                            label='Model Name'
                                            rules={[{required:true},{validator:validateField}]}
                                            hasFeedback>
                                            <Input placeholder="Generic Model" />
                                        </Form.Item>
                                    </Form>     
                                </Col>
                                <Col id="opCols" span={4}>
                                    <Tooltip placement="right" title="All Operations">        
                                        <Button id="button" type="primary" icon={<FolderOpenOutlined/>} onClick={()=>showDrawer("Add/Edit/Del Ops")}/>    
                                    </Tooltip>            
                                    <Tooltip placement="right" title="Add Operation">                                                      
                                        <Button id="button" type="primary" icon={<PlusOutlined/>} disabled={!opEnabled} onClick={()=>{form.resetFields(); showDrawer("Add Op")}}/>  
                                    </Tooltip>
                                    <Tooltip placement="right" title="Edit Operation">        
                                        <Button id="button" type="primary" icon={<EditOutlined/>} disabled={!opEnabled} onClick={()=>{form.resetFields(); showDrawer("Edit Op")}}/> 
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="Remove Operation">        
                                        <Button id="button" type="primary" icon={<DeleteOutlined/>} disabled={!opEnabled} onClick={"nothing"}/>  
                                    </Tooltip>
                                
                                </Col>                                                 
                            </Row>                                       
                        </Card>
                    </Col>

                    <Col span={12}>                   
                        <Card title="Popular Links Configuration">
                            <Row gutter={8}>
                                <Col span={14}>
                                    <Form {...formProps[1]}>                                        
                                        <Form.Item 
                                            name='linkName' 
                                            label='Link Name'
                                            hasFeedback>
                                            <Input placeholder="EMA" />
                                        </Form.Item>
                                    </Form>
                                </Col>       
                                <Col span={4}>
                                    <Tooltip placement="right" title="All Popular Links">        
                                        <Button id="button" type="primary" icon={<FolderOpenOutlined/>} onClick={()=>showDrawer("Add/Edit/Del Links")}/>    
                                    </Tooltip>
                                    <Tooltip placement="right" title="Add Popular Link">        
                                        <Button id="button" type="primary" icon={<PlusOutlined/>} disabled={!linkEnabled} onClick={()=>showDrawer("Add Link")}/>                                   
                                    </Tooltip>
                                    <Tooltip placement="right" title="Edit Popular Link">        
                                        <Button id="button" type="primary" icon={<EditOutlined/>} disabled={!linkEnabled} onClick={()=>showDrawer("Edit Link")}/>                                  
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="Remove Popular Link">        
                                        <Button id="button" type="primary" icon={<DeleteOutlined/>} disabled={!linkEnabled} onClick={"nothing"}/>
                                    </Tooltip>
                                
                                </Col>
                            
                            </Row>
                                                
                        </Card>
                    </Col>

                    <Col span={24}>                   
                        <Card title="Model Configuration">                        
                            <Row gutter={80}>
                                <Col span={16}>
                                    <Form layout="vertical" icon={<PlusOutlined/>} requiredMark={'hidden'} onValuesChange={"nothing"}>                                        
                                        <Form.Item 
                                            name='modelName' 
                                            label='Model Name'
                                            hasFeedback>
                                            <Input placeholder="Generic Model" />
                                        </Form.Item>
                                    </Form>
                                </Col>
                                <Col span={3}>    
                                    <Tooltip placement="right" title="All Popular Models">        
                                        <Button id="button" type="primary" icon={<FolderOpenOutlined/>} onClick={()=>showDrawer("Add/Edit/Del Models")}/>                                    
                                    </Tooltip>
                                    <Tooltip placement="right" title="Add Popular Model">        
                                        <Button id="button" icon={<PlusOutlined/>} type="primary" disabled={!modelEnabled}onClick={()=>showDrawer("Add Model")}/>                                    
                                    </Tooltip>
                                    <Tooltip placement="right" title="Edit Popular Model">        
                                        <Button id="button" icon={<EditOutlined/>} type="primary" disabled={!modelEnabled} onClick={()=>showDrawer("Edit Model")}/>                                 
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="Remove Popular Model">        
                                        <Button id="button" icon={<DeleteOutlined/>} type="primary" disabled={!modelEnabled} onClick={"nothing"}/>  
                                    </Tooltip>                            
                                    
                                </Col>                          
                            </Row>                                                  
                        </Card>
                    </Col>                
                </Row>  
            </div>
        )
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

    return(
        <ConfigFormContext.Provider value={{ form, formRender, setValidate, disabled }}>
            {props.children}
        </ConfigFormContext.Provider>
    )
}

export default ConfigFormContextProvider