import { createContext, useContext, useEffect, useState } from 'react';

import { ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import {  Alert, Badge, Card, Row, Col, Table, Tooltip} from 'antd';

import ItemAudits from '../../pageComponents/Audit Logs/ItemAudits.js';
import { DrawerContext } from '../../contexts/DrawerContext';
import { ConfigContext } from '../ConfigContext.js';

//"date format Library" Import 
import moment from 'moment';

export const DetailsTableContext = createContext();

const DetailsTableContextProvider=(props)=>{
    const {dateFormat, breakPoint, parseAttachName, checkOp, count, setCount}= useContext(ConfigContext);
    const {jobData, visible, auditOnly, detailRowTitles, setDetTitles}=useContext(DrawerContext);   
    const [statData, setStatData]=useState([
        {
            jobStat:"Pending.."
            //jobData!==null? jobData.status : null          
        },      
    ])
    const [uniqueProps, setUniqueProps] = useState();
    const [tabList, setTabList]= useState([]); 
    const [key, setKey]= useState();

    const [attachFilesData, setFilesData]=useState(null);

    const [selectedFiles, setSelectedFiles]=useState(null);
    
    const initialTitles=[   
        {
            key: 'Det4',
            section:'Audit Logs'
        },   
        {
            key:'Det1',
            section:'General Entry Details'
        }
    ];

    const onTabChange = (key) => {
        console.log(key);
        setKey(key);
    };

    //defines the columns for the status table
    const statTabCols = [     
        {
            title: 'Status',
            key: 'stat',
            dataIndex:'jobStat',
            render: (stat) => ( 
                <span>
                    <Badge status="warning"/>
                    {stat}                   
                </span>
            ),
        }       
    ]

    const downloadFiles=(fileType, fileRows)=>{
        const inputFiles=[];
        const outputFiles=[];
       
        fileRows.forEach((row)=>{
            if(fileType==="Input"){
                inputFiles.push(row.inFile);
                //request to download file from blob storage
            }
            else if(fileType==="Output"){
                outputFiles.push(row.outFile);
                //request to download file from blob storage
            }           
        })        
    }

    const downloadLinkRender=(col)=>{
        if (col==="input"){
            return(
                <span key="1">
                    Input Files
                    <Tooltip placement="bottom" title="Download">
                        <DownloadOutlined onClick={()=>downloadFiles("Input", selectedFiles)} id="downLink"/>
                    </Tooltip>
                    
                </span>
            )
        }
        else if (col==="output"){
            return(
                <span key="2">
                    Output Files
                    <Tooltip placement="bottom" title="Download">
                        <DownloadOutlined onClick={()=>downloadFiles("Output", selectedFiles)} id="downLink"/>
                    </Tooltip>
                    
                </span>
            )
        }                   
    }

    const fileRowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedFiles(selectedRows);
            console.log(selectedRows);
        },    
    };

    //defines columns for table in attachment section
    const attachFilesCols = [
        { title: downloadLinkRender("input"), dataIndex: 'inFiles', key: 'input'},
        { title: downloadLinkRender("output"), dataIndex: 'outFiles', align: 'center', key: 'output'}        
    ]

    const drawerDetailSet=async()=>{
        const newFileData=[];
        if("input" in jobData.requestAttachments){
            jobData.requestAttachments.input.forEach((inFile, index)=>{  
                newFileData.push({
                    "key":index, 
                    "inFiles":parseAttachName(inFile.attachment.name)                   
                })                  
            })
            if("output" in jobData.requestAttachments){
                var fileDataIndex = null
                var file = null
                jobData.requestAttachments.output.forEach((outFile, index)=>{  
                    file = newFileData.find((fileData, arrIndex)=> {
                        if(fileData.key===index){
                            fileDataIndex=arrIndex
                        }                        
                        return fileData.key===index
                    })
                    console.log("The fle is", file)
                    newFileData[fileDataIndex]= {
                        "key":index, 
                        "inFiles":file!=null? file.inFiles: "",                      
                        "outFiles":parseAttachName(outFile.attachment.name),
                       
                    }                  
                })
            }
        }
        return newFileData
    }

    const detailRowRender=(record)=>{
        
        if (record.section==="General Entry Details"){
            return(
                   
                <Row gutter={[50,50]}>
                     {   
                        breakPoint ==="lg" || breakPoint ==="xl" || breakPoint ==="xxl"?
                        null:
                        <Col span={24}>
                            <Alert message={`Job Scheduled to execute at ${moment(jobData.schedule_date_time).local().format(dateFormat)}`} type="info" />
                        </Col>

                    }
                    <Col id="statusTable" md={8} xs={24}>
                        <Table columns={statTabCols}  dataSource={statData} pagination={false} size="small"/>
                    </Col>
                   
                    {
                        jobData.comments!= undefined?
                            (<Col id="commentCard" md={16} xs={24}>
                                <Card size="small" title="Comment">
                                    <p>{jobData.comments}</p>                   
                                </Card>
                            </Col>):null  
                    } 
                </Row>
               
            )  
        }
        else if(record.section==="Attachments"){
            return (
                <div id="attachmentsTable">
                    <Table columns={attachFilesCols}  rowSelection={{type: 'checkbox', ...fileRowSelection,}} dataSource={attachFilesData} pagination={{pageSize:4, hideOnSinglePage:true}} size="small" />
                </div>
            ) 
        }
        else if(record.section==="Operation Specific Details"){
            return ( 
                <div  id="uniquePropsCard">
                    <Card                       
                        style={{ width: '100%' }}                                      
                        tabList={tabList}
                        activeTabKey={key}
                        onTabChange={key => onTabChange(key)}>
                            {uniqueProps[`${key}`]}
                    </Card>
                </div>               
                
            )
        }
        else if(record.section==="Audit Logs"){
            
            return(                
                <ItemAudits/> 
            )
        } 
    }
    

    useEffect(() => {      

        if(!auditOnly){
            setDetTitles(initialTitles);
            setTabList([]);
            checkOp().then((value)=>{                        
                console.log("Request Props", value)
                if(value.propTestString==true && count<1){
                    setDetTitles((prevTitles)=>[...prevTitles,{
                        key:'Det3',
                        section:'Operation Specific Details'
                    }])
                    setCount((count)=>count+1);
                }
                else if(value.propTestString==="fileOnly" && count<1){
                    setDetTitles((prevTitles)=>[...prevTitles,{
                        key:'Det2',
                        section:'Attachments'
                    }])
                    setCount((count)=>count+1);
                }
                else if(value.propTestString=="both" && count<1){
                    const bothFields=[{
                        key:'Det3',
                        section:'Operation Specific Details'
                    },
                    {
                        key:'Det2',
                        section:'Attachments'
                    }]; 
                    setDetTitles((prevTitles)=>[...prevTitles, ...bothFields])
                    setCount((count)=>count+1);
                }
                else{
                    setDetTitles(initialTitles);
                    setCount(0);
                }
                console.log("Job data to be modified:",jobData)
                if(jobData!=null){
                    drawerDetailSet().then((fileData)=>{
                        setFilesData(fileData);
    
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
                                           
                                uniqueFields[`${name}`]=Object.values(jobData.uniqueFields.find((field)=> Object.keys(field)[0]===name))[0];
                                
                                setTabList((prevTabList)=>[...prevTabList,                                                       
                                    {
                                        key: `${name}`,
                                        tab: `${name}`
                                    }
                                ])
                                //checks if unique property is of type date based on default value defined in configurations
                               
                            })
                            setUniqueProps(uniqueFields);
                            console.log("The unique Fields are", uniqueFields);
                        }
                    });
                }
            })
        }
        else{
            console.log("Im about to display Audit Logs Only");
            setDetTitles([   
                {
                    key: 'Det1',
                    section:'Audit Logs'
                }
            ])
           
        }
             
      
    }, [])

    return(
        <DetailsTableContext.Provider value={{ detailRowRender, detailRowTitles, parseAttachName, setDetTitles }}>
            {props.children}
        </DetailsTableContext.Provider>
    )
}

export default DetailsTableContextProvider
