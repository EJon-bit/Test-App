//React native import
import { useContext, useEffect, useState } from 'react';


//Ant Design Native Components import
import { Table, Card, Col, Row, Button, Popconfirm, Tag, Tooltip} from 'antd';
import { EllipsisOutlined, SearchOutlined, EditOutlined, DeleteOutlined, InteractionOutlined, AuditOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons'

//"date format Library" Import 
import moment from 'moment';

//Custom Components import
import { ConfigContext } from '../../../contexts/ConfigContext';
import {DrawerContext} from '../../../contexts/DrawerContext';
import CustomModal from '../../Global/CustomModal';
import GeneralAudits from '../../Audit Logs/GeneralAudits';


//component renders list of scheduled jobs and buttons to modify/delete them
const SubmittedJobs=()=>{
    
    //context variables to render drawer, PopConfirm components and alter page responsiveness
    const { jobs, setJobs, setDelRecord, setAuditOnly, setJobAudits, showDrawer }=useContext(DrawerContext) 
    const { 
        breakPoint, columnSearchRender, confirmLoading, dataSource, dateFormat,
        delVisible, handleCancel, handleOk, itemAction, path, renderModal,
        tableData,  setConfirmLoading, setDelVis, setModalVisible, setTableData      
    }= useContext(ConfigContext);
   
    const[buttonDisabled, setButtonDisabled]=useState(true);
    const[buttonEnabled, setButtonEnabled]=useState(false);   
        
    //defines a job from the list of submitted Jobs to be modified or removed
    const [selectedJobs, setSelectedJobs]=useState();  
    
    var filteredRows=[];
    var newTableData=[];
    var rowRecord=[];
    var searchColumn=[];

    //fetches details for a job item selected from table and triggers the rendering of drawer displaying said details
    const showDetails=(record)=>{
        return {
            onClick: ()=> {
                setAuditOnly(false);
                console.log("The data is", record);
              
                const itemEntry= jobs.find((job)=>job.name==record.jobName);
                console.log("Item Details", itemEntry);

                setDelRecord(itemEntry);
                showDrawer("Job Details", itemEntry)
            }
        }
    }


     //defines the columns for the table of scheduled/submitted Jobs
    const columns = [
        { title: columnSearchRender("jobs"), dataIndex: 'jobName', key: 'Job Name', align: 'center', width: 220 },  
        { title: "Date Scheduled", dataIndex: 'scheduledDate', key: 'Date Scheduled', align: 'center', width: 270, responsive: ['lg']},
        { title: "Date Created", dataIndex: 'createdDate', key: 'Date Created', align: 'center', width: 250, responsive: ['md']},
        { title: "Actions", dataIndex: 'actions', key: 'Actions', align: 'center', width: 260, responsive: ['xl'], render: (_,record) => actionButtons(record) },
        { title: "More Details", key: 'operation', align: 'center', onCell: showDetails,  width: 5, responsive: ['sm'], render: () => <EllipsisOutlined id="moreDeets" key="ellipsis"/> },
    ];

     //sets the "selectedJobs" state whenever a item from the list of scheduled Jobs is selected
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log("unsaved selected", selectedRows)
            setButtonEnabled(true);   
            
            filterSelection(selectedRows)
            .then((rows)=>{
                if(rows.length==1){
                    setSelectedJobs(rows[0].id);
                    setButtonDisabled(false);    
                            
                
                }
                else if(rows.length==0){
                    setButtonEnabled(false); 
                    setButtonDisabled(true);
                }
                else if(rows.length>1) {
                    var rowIds = []
                    rows.forEach(row=>{
                        rowIds.push(row.id)
                    })
                    console.log("The rows are ", rowIds)
                    setSelectedJobs(rowIds);
                    setButtonDisabled(true);
                    
                } 
            })            
        }
    }
  
     //defines props for table of job items
    var jobsTableProps={
        rowSelection:{type: 'checkbox', ...rowSelection},
        columns:columns,           
        dataSource:dataSource.length? dataSource:tableData,
        pagination:{pageSize:5, hideOnSinglePage:true},       
    }

    const actionClick=(record, actionType, popUpId)=>{
        rowRecord.push(record)
        // console.log("The record is", rowRecord);
        // console.log("del Vis is", delVisible);
    
        if(actionType==="modify"){
            filterSelection(rowRecord)
            .then((rows)=>{                
                showDrawer("Modify Job", rows[0]);
            })           
        }
        else if(actionType==="execute"){
            // console.log("record key is ", record.key)         
            setDelVis({...delVisible, [`exec${record.key}`]:true});
        }
        else{          
            // console.log("record key is ", record.key)         
            setDelVis({...delVisible, [`item${record.key}`]:true});
        }
    }
    

    //renders "execute","modify",and "delete" buttons respectively for each job/item record
    const actionButtons=(record)=>{ 
        if(tableData.length >= 1){
                  
            return(
                <Row align="middle" justify="center" gutter={8}>
                    <Col>
                        <Tooltip placement="bottom" title={"Execute"}>
                            <Popconfirm 
                                key={`record-${record.key}`}
                                id="popConfirm"
                                title="Are you Sure?"
                                placement="bottom"
                                visible={ `exec${record.key}` in delVisible? delVisible[`exec${record.key}`]: false}
                                onConfirm={()=>executeJob(record, `exec${record.key}`)}
                                okButtonProps={{ loading: confirmLoading }}
                                onCancel={()=>handleCancel(`exec${record.key}`)}>
                                    <Button
                                        id="actionButton"
                                        type="primary"
                                        icon={<InteractionOutlined />}                 
                                        onClick={()=>actionClick(record, "execute", `${record.key}`)}
                                    />
                            </Popconfirm>
                        </Tooltip>
                    </Col>         
                    <Col>
                        <Tooltip placement="bottom" title={"Modify"}>
                            <Button
                                id="actionButton"
                                type="primary"
                                icon={<EditOutlined />}                 
                                onClick={()=> actionClick(record, "modify")}
                            />
                        </Tooltip>
                    </Col>
                    <Col>
                        <Tooltip placement="bottom" title={"Cancel"}>
                            <Popconfirm 
                                key={`record-${record.key}`}
                                id="popConfirm"
                                title="Are you Sure?"
                                placement="bottom"
                                visible={ `item${record.key}` in delVisible? delVisible[`item${record.key}`]: false}
                                onConfirm={()=>handleOk(null, deletedJob(record))}
                                okButtonProps={{ loading: confirmLoading }}
                                onCancel={()=>handleCancel(`item${record.key}`)}>
                                <Button
                                    id="actionButton"
                                    type="primary"
                                    icon={<DeleteOutlined />}                 
                                    onClick={()=>actionClick(record, "delete", `${record.key}`)}
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Col>                      
                </Row>
            )
        }      
        else{
            return null
        }
        
    }
    
    
     
    
    //connects to the backend to trigger the execution a selected job
    const executeJob=(record, jobItem)=>{
        console.log("the record", record)
        setConfirmLoading(true);
        const job = jobs.find((job)=>{
            const jobDate = new Date(job.schedule_date_time).getTime()
            const recordDate = new moment(record.scheduledDate, dateFormat).utc().valueOf();

            console.log("record date ", recordDate)
            console.log("job date",  jobDate)
           

            return (job.name === record.jobName && recordDate==jobDate)
        })
        console.log ("the filtered job id is ", job.id)
        const requestOptions={
            method: 'POST',                      
            body: JSON.stringify({"id": job.id}),
            headers: { 'Content-Type': 'application/json' }
        } 
                           
        fetch("http://localhost:5000/itemOperation/executeJob", requestOptions)
        .then(async response => {
            const data = await response.json();

            // check for error response
            if (!response.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
            else{    
                setConfirmLoading(false);
                setDelVis({[`${jobItem}`]: false });                
                renderModal("success", 'POST');             
                console.log(data);
            }
        })
        .catch(error => { 
            setConfirmLoading(false);
            setDelVis({[`${jobItem}`]: false });   
            renderModal("error", 'POST');        
            console.error('There was an error!', error);
        });
    }

    //fetches the id for the job item a user tries to delete
    const deletedJob=(record)=>{
        const itemEntry= jobs.find((job)=>job.name===record.jobName);
        return itemEntry.id
    }

    //retrieves details for job items when the checkbox corresponding to that job item has been ticked
    const filterSelection=async(selectedRows)=>{
        const filteredRows=[];

        selectedRows.forEach((row)=>{
            const selectedJob= jobs.find((job)=>{ 
                console.log("The job is", job.name);                
                return job.name==row.jobName; 
            });

            filteredRows.push(selectedJob);
            console.log("Selected Job", filteredRows);

        })

        return filteredRows            
    }

    //fetches all the job items corresponding to the specific operations process page being loaded
    const getJobOps= async()=>{
        const res= await fetch(`http://localhost:5000/itemOperation/opType/${path[1]}`);
                     
        if (!res.ok) {
            throw new Error("No Data was fetched");
        }
        else{

            const data = await res.json();
            return data;
        }
        
       
    }
   
    
    //parses through the data fetched via backend api to tabulate each object/jobItem in the data
    const tableDataSet= async(data)=>{
        await data.forEach((job, index)=>{  
            newTableData.push({
                "key":index,
                "jobName":job.name,       
                "scheduledDate":moment(job.schedule_date_time).local().format(dateFormat),
                "createdDate":moment(job.submitDate).local().format(dateFormat)
            });                         
        })
      
        return newTableData;
    };
     
   
      
    useEffect(()=>{ 
       
        getJobOps()
        .then((data) =>{            
            setJobs(data.items);
            setJobAudits(data.auditLogs)
            console.log("Item entries are", data);
            return tableDataSet(data.items);           
            
        })
        .then((tableValues)=>{
            console.log("table Data", tableValues);
            setTableData(tableValues);            
        })
        .catch(error => {               
            console.log(error);
        });    
        
    },[itemAction])
    
    return(
        
        <div id="subJobs"> 
            <Card id="subJobMain" title="Submitted Jobs">
                <Row>                
                    <Col id="tableCol" lg={24}>                      
                        <Table {...jobsTableProps} />                         
                    </Col>                    
                </Row>

                <Row justify="center" align="center">
                    <Col>  
                        <Tooltip id="cancelTooltip" placement="bottom" title={"Check the Box Corresponding to each Job you Wish to Cancel"}>                   
                            <Popconfirm 
                                id="popConfirm"
                                title="Are you Sure?"
                                placement="right"
                                visible={delVisible.main}
                                onConfirm={()=>handleOk(selectedJobs)}
                                okButtonProps={{ loading: confirmLoading }}
                                onCancel={()=>handleCancel()}>
                                <Button id="cancelButton" type="primary" disabled={!buttonEnabled} onClick={()=>setDelVis({main:true, drawer:false})}>
                                    Cancel Job(s)
                                </Button>                         
                            </Popconfirm>
                        </Tooltip>
                    </Col>                  
                </Row> 
                {
                    breakPoint==="xs"?
                    <>
                        <br/>
                        <Row justify="center" align="center">
                            <Col>  
                                <Button id="detailsButton" type="primary" disabled={!buttonEnabled} onClick={()=>{showDrawer("Job Details", selectedJobs)}}>
                                    See Job Details
                                </Button>                         
                            </Col>
                        </Row>
                    </>
                    :null
                }        

                {
                     breakPoint==="xl" || breakPoint==="xxl" || breakPoint==="lg"?
                        <Row justify="end">
                            <Col id="tagCol">
                                <Tag color="volcano">
                                    <a id="itemLogsLink" onClick={()=>setModalVisible(true)}>
                                        {/* <img className="example-link-icon" src="../../../Images/audit-bg.jpg"/> */}
                                        <Icon id="auditIcon" component={AuditOutlined}/>
                                        See All Audit Logs
                                    </a>
                                </Tag>
                            </Col>
                        </Row>
                        :null
                }

            </Card>

            <CustomModal title={`Audit Logs for ${path[1]}`} modalText={<GeneralAudits/>}/>
           
        </div>
        
    );
}


export default SubmittedJobs