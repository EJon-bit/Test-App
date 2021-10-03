//React native imports
import React, { useState, useContext, useEffect } from 'react';

//css Imports
// import "../../../../scss/ComponentCss/OperationCss/AuditLogTable.css"

//UI Library (Ant Design) Components Import
import { Table, Badge, Row, Col, Tag, Alert } from 'antd';
import { FormTableContext } from '../../contexts/TableSubContexts/FormTableContext';

import moment from 'moment';
import { DrawerContext } from '../../contexts/DrawerContext';
import { ConfigContext } from '../../contexts/ConfigContext';

//component to render table listing all the details of all users who accessed an operation
const ItemAudits =()=> {
    const {dateFormat}= useContext(FormTableContext);
    const {jobData, jobAudits}= useContext(DrawerContext);    
    const [jobCreator, setJobCreator]= useState();

    const [auditData, setAuditData]=useState([]);

    const [fieldModData, setFieldModData]= useState([]);

    const [fileModData, setFileData]= useState([]);


    const auditsColumns = [   
        {   
            align:'center',
            title:'Entry Created By: ' + jobCreator,
            children:[
                { title: 'Modified By', dataIndex: 'modifiedBy', key: 'editor' },
                { title: 'Date Modified', dataIndex: 'modifiedAt', key: 'modifiedAt', align:'center' }
            ]
        }            
       
    ]

    const fieldChangeColumns = [
        {
          title: 'Field',
          dataIndex: 'fieldName',
          key: 'name',
          align:"center"
          
        },
        {
          title: 'Old Value',
          dataIndex: 'prevVal',
          key: 'val1',
          align:"center",
          render: prevVal => {
            return(
                <Tag color="volcano">
                    {prevVal}
               </Tag>   
            )}          
        },
        {
          title: 'New Value',
          dataIndex: 'newVal',
          key: 'val2',
          align:"center",
          render: newVal => {
            return(
                <Tag color="geekblue">
                    {newVal}
                </Tag>   
                    
            )}       
        },
    ]

    const fileChangeColumns = [
        {
            title: 'Old File',
            dataIndex: 'prevFile',
            key: 'file1',
            align:"center",
            render: prevFile => {
                return(
                    <Tag color="volcano">
                        {prevFile}
                    </Tag>                  
                  
                )}          
        },
        {
            title: 'New File',
            dataIndex: 'newFile',
            key: 'file2',
            align:"center",
            render: newFile => {
                return(
                    <Tag color="geekblue">
                     {newFile}
                    </Tag>                                     
                   
                )}       
        },
    ]

    const expandedRowRender=(record)=>{
        const rowNum=parseInt(record.key)
        return(
            <Row id="expandedAudit" gutter={50}>
                {
                    fieldModData.length!=0?
                        <Col id="changeTables" span={24}>
                            <Tag id="changeTag" color="green">Field Changes</Tag>
                            <Table columns={fieldChangeColumns} dataSource={fieldModData[rowNum][`update-${rowNum}`]} pagination={false} size="small"/>
                        </Col>:  <Tag id="changeTag" color="green">No field Changes</Tag>
                }
                {
                    fileModData.length!=0?
                        <Col id="changeTables" span={24}>
                            <Tag id="changeTag" color="green">File Changes</Tag>
                            <Table columns={fileChangeColumns} dataSource={fileModData[rowNum][`update-${rowNum}`]} pagination={false} size="small"/>
                        </Col> :   <Tag id="changeTag" color="volcano">No file Changes</Tag>       
                }      
            </Row>
        )
    }

    useEffect(()=>{
        console.log("Job Data is", jobData);
        console.log("The job audits are", jobAudits)
        var audits =[];
        var modFields=[];
        var modFiles=[];
        //loops through audit logs corresponding to a particular job item to deduce who created and updated that job item
        jobAudits.forEach((jobAudit, auditIndex)=>{
            if(jobAudit.logInfo.some((info)=>{                
                if('document_created' in info.action){
                    return info.action.document_created.name===jobData.name
                }                
            })){
                console.log("The creator is", jobAudit.user_id)
                setJobCreator(jobAudit.user_id);                
            }
            
            //if audit contains update info regarding the selected job
            if(jobAudit.logInfo.some((info)=>{               
                if('document_updated' in info.action){
                    return info.action.document_updated.name===jobData.name
                }
                
            })){
                const updatedJobAudits = jobAudit.logInfo.filter((info)=>{
                    if('document_updated' in info.action){
                        return info.action.document_updated.name === jobData.name
                    }
                })
                
                const regexDate=/^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2}).(\d*)Z/;
                
                console.log("The update audits", updatedJobAudits);
                //fills audit log table with each row displaying info about an update made to a job item by a particular user 
                updatedJobAudits.forEach((auditLog, index)=>{
                    audits.push({
                        "key": auditIndex>=1? `${audits.length}`:`${index}`,        
                        "modifiedBy":`${jobAudit.user_id}`, 
                        "modifiedAt": moment(auditLog.action.action_effects.time).local().format(dateFormat)
                    });

                    const fieldsChanged= auditLog.action.action_effects.changes.find((change)=> change.change_type==='field');
                    const filesChanged= auditLog.action.action_effects.changes.find((change)=> change.change_type==='file')
                    console.log("The files change are", filesChanged);
                    
                    const arrayIndex=auditIndex>=1? modFields.length:index;
                    const fileArrayIndex=auditIndex>=1? modFiles.length:index;

                    if(fieldsChanged!=null || fieldsChanged!=undefined){
                        modFields[arrayIndex]= {[`update-${arrayIndex}`]:[]};

                        fieldsChanged.fields.forEach((field, key)=>{                        
                            modFields[arrayIndex][`update-${arrayIndex}`].push({
                                "key": `${key}`,
                                "fieldName": field.name,
                                "prevVal": regexDate.test(field.old_value)? moment(new Date(field.old_value)).local().format(dateFormat): field.old_value,
                                "newVal": regexDate.test(field.new_value)? moment(new Date(field.new_value)).local().format(dateFormat): field.new_value,         
                            })
                        })
                    }   

                    if(filesChanged!=null || filesChanged!=undefined){
                        modFiles[fileArrayIndex]= {[`update-${fileArrayIndex}`]:[]};
                                                             
                        modFiles[fileArrayIndex][`update-${fileArrayIndex}`].push({
                            "key": `${modFiles.length}`,                           
                            "prevFile": [...filesChanged.old_files],
                            "newFile": [...filesChanged.new_files]
                        })
                    }  

                })
                console.log("fields data", modFields)
                console.log("Files", modFiles)
                setFileData(modFiles)
                setFieldModData(modFields);
                setAuditData(audits);                
            }
           
        })
    }, [])

    return (
        <div id="auditTable">
            <Table columns={auditsColumns} dataSource={auditData} pagination={{pageSize:4, hideOnSinglePage:true}} expandable={{expandedRowRender}} size="small"/>
        </div>
    )
}

export default ItemAudits
