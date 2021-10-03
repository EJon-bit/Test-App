import { useState, useContext, useEffect } from 'react';

//css Imports
// import "../../../../scss/ComponentCss/OperationCss/AuditLogTable.css"

//UI Library (Ant Design) Components Import
import { Table, Badge, Row, Col, Tag, Alert } from 'antd';

//importing context API components to access global/shared state variables
import { ConfigContext } from '../../contexts/ConfigContext';
import { DrawerContext } from '../../contexts/DrawerContext';

//renders a table listing audit information for app configurations and job item modifications 
const GeneralAudits =()=> {

    //calls useContext hook to access declared variables from their corresponding Context API Components
    const {columnSearchRender, form, path}= useContext(ConfigContext);  
    const {jobs, setAuditOnly, showDrawer}= useContext(DrawerContext); 

    const [opSettingsAudits, setOpSettingsAudit]= useState(null);
    const [opJobAudits, setJobAudits]= useState(null);

    
    const auditColumns = [
        { title: 'Audit Type', dataIndex: 'auditType', key: 'Audit Type', width: 220 }      
    ];

    const expandedRowRender=(record)=>{
        if(record.key.match(/Settings/)){
            return(
                <>{settingsAuditRender()}</>
            )
        }  
        else{
            return(
                <Table id="jobAudits" size="small" columns={jobAuditCols} dataSource={opJobAudits}  pagination={{pageSize:4, hideOnSinglePage:true}}/>
            )
        }    
    }

    var auditData= [
        {
            key: 'Settings',
            auditType: 'Settings Logs'            
        },
        {
            key: 'Job Item Logs',
            auditType: 'Job Item Logs',             
        },

    ];

    var auditRowSelection={
        
    };

    var auditTableProps={      
        columns:auditColumns,           
        dataSource: auditData,
        expandable: {expandedRowRender},
        pagination:false
    };

   
   
    const fetchAudits=(record)=>{
        const jobItem= jobs.find((job)=>job.name==record.jobItem);
        setAuditOnly(true);
        showDrawer("Job Details", jobItem);
    };

    const getAuditData= async()=>{
        var res =null;

        if(path[1]!=="Configurations"){
            res= await fetch(`http://localhost:5000/auditOperation/opType/${path[1]}`);
        }
        else{
            console.log("OpType", form.getFieldsValue(['opName']).opName)
            res= await fetch(`http://localhost:5000/auditOperation/opType/${form.getFieldsValue(['opName']).opName}`);
        }
        
                     
        if (!res.ok) {
            throw new Error("No Data was fetched");
        }
        else{

            const data = await res.json();
            console.log("The Audit backend data is", data);
            return data;
        }
        
       
    }

    const jobAuditCols=[
        { title: 'Job Item', dataIndex: 'jobItem', key: 'jobItem', align: 'center', width: 220 },
        { title: "Created By", dataIndex: 'creator', key: 'creator', align: 'center', width: 200, },
        { title: "Edited By", dataIndex: 'editors', key: 'editors', align: 'center', width: 300, render: (_, record)=>(
            <span>             
                {
                    record.editors.map((editor, index) => {
                        let color = editor.length > 5 ? 'geekblue' : 'green';                       
                        return (
                            <Tag color={color} key={index}>
                                <a onClick={()=>fetchAudits(record)}>
                                    {editor}
                                </a>
                            </Tag>
                        );
                    })
                }
            </span>),
    }];
   
    const settingsAuditRender=()=>{
        opSettingsAudits.map((fileId)=>{
            return(
                <Tag color="volcano">
                    <a id="itemLogsLink" onClick={()=>showDrawer("Compare")}>                                      
                        {fileId}
                    </a>
                </Tag>
            )
        })
    }


    useEffect(()=>{
        getAuditData()
        .then((data) =>{ 
            var jobAuditData= []
           
            data.itemAuditLogs.forEach(element => {
                element.logInfo.forEach(info=>{
                    if('document_created' in info.action){
                        jobAuditData.push({'jobItem':info.action.document_created.name, 'creator':element.user_id})
                    } 
                })
            });
          
            jobAuditData.forEach((jobData)=>{
                data.itemAuditLogs.forEach(element => {
                    element.logInfo.forEach(info=>{
                        if('document_updated' in info.action){
                            if(jobData.jobItem===info.action.document_updated.name){
                                if('editors' in data){
                                    jobData.editors.push(element.user_id)
                                }
                                else{
                                    jobData.editors=[element.user_id]
                                }
                            }
                            
                        }
                        else{
                            jobData.editors=[]
                        }
                    })
                })
            });
            console.log("parsed audit data is", jobAuditData);

            setOpSettingsAudit(data.settingAuditLogs)
            setJobAudits(jobAuditData);                    
            
        })       
        .catch(error => {               
            console.log(error);
        });   
    },[])

    return(
        <Col id="tableCol" lg={24}>
            <Table id="generalAudits" {...auditTableProps} />
        </Col>
    )
   
}

export default GeneralAudits