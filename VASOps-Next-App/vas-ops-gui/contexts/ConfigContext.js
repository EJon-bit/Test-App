//React native imports
import { createContext, useEffect, useState, useRef } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
//import ProtectedRoute from '../routes/ProtectedRoutes';

import Operation from '../pages/Operations/[Operation]';

import { Button, Input, Menu, Modal, Col, Card, Row, Form, Avatar} from 'antd';
import { CloseCircleOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
//import Icon from '@ant-design/icons';
//import EricssonEma from '../Images/PopLinksIcons/ericsson.svg';

//import '../less/modal.less'
//import SvgEricsson from '../components/IconComponents/Ericsson';

const {Meta}=Card;
//allows wrapped components to have access to fxns and states defined here
export const ConfigContext = createContext();
 
//A react component wrapping other components to enable the sharing of its functions and states via (useContext hook) 
const ConfigContextProvider=(props)=>{

    const [authenticated, setAuthenticated]= useState(false);
    const [userId, setUserId]=useState(null)
    const [opPageOrigin, setOrigin]=useState(false);
    const [prevPath, setPrevPath]= useState(false);
    const[modalVisible, setModalVisible]=useState(false);
    const [operations, setOperations] = useState();
    const [popLinks, setPopLinks]= useState();
    //const [routes, setRoutes]=useState();
    const [opData, setOpData]=useState(null);
    const [popLinksData, setPopData]=useState();
    const [opSettingsId, setId]=useState();
    const [popId,setPopId]=useState();
    const [opType, setOpType]= useState();
    const [reqFileCount, setFileCount]=useState();
    const [inFiles, setInFiles]=useState();
    const [delVisible, setDelVis]=useState({
        drawer: false,
        main: false 
    });
    const [confirmLoading, setConfirmLoading]= useState();
    const [layoutMargin, setLayoutMargin]= useState(250);
    const [reqProps, setReqProps]= useState([]);
    const [settingsType, setSettingType]=useState(null);
    const [settingsData, setSettingData]=useState(null);
    const [breakPoint, setBreakPoint]=useState();
    const [count, setCount]=useState(0);
    const [headerGrid, setHeaderGrid]=useState({
        componentSize:{
            lgTitle:6,
            lgMenu:6
        },
        componentOffset:{
            titleOffset:7,
            menuOffset:4
        }
    })
    const [popLinksGrid, setPopGrid]= useState({
        rowProps:{},
        colProps:{
            popTitle:{offset:8},
            searchBar:{offset:3}
        }
    });
    const [dummyVal, setDummyVal]= useState(null);    
    const [configFieldsVal, setConfigVal]= useState(null);
    const dataUpdated = useRef(false);
    var [value, setValue] = useState('');
    const [showSearch, setShowSearch]=useState(false);
    const [itemAction, setItemAction]= useState(false);
    const [tableData, setTableData] = useState([]);
    const [dataSource, setDataSource] = useState(tableData);
    const router=useRouter();
    const routerPath=router.pathname.split("/",3);
    const path= routerPath.length<3? routerPath: [" ", router.query.Operation];

    const [form] = Form.useForm();
   
        
    let otherFields=null;
    //sets te display format for Date in 'schedule_date_time' field
    const dateFormat = 'YYYY/MM/DD, h:mm:ss a';

    const handleOk = (selectedJobs, job) => {
        console.log("Cancelling:", job!=null?job:selectedJobs)
        setConfirmLoading(true);
 
        const options={
            method:'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({"id":job!=null?job:selectedJobs})
        }
        fetch('http://localhost:5000/itemOperation/delItems',options)
        .then(async(res)=>{

            const data = await res.json();

            if(!res.ok){
                 // get error message from body or default to response status
                 const error = (data && data.message) || res.status;
                 return Promise.reject(error);
            }
            else{
                router.push('/Operations/[Operation]',`Operations/${path[1]}`);

                if(selectedJobs== null){
                    setConfirmLoading(false); 
                    setDelVis({[`${job}`]: false });
                    renderModal("success", "DELETE");  
                }
                else{
                    setConfirmLoading(false); 
                    setDelVis({ drawer: false, main: false});
                    renderModal("success", "DELETE");  
                }
              
            }

        })
        .catch(error => {     
            setConfirmLoading(false)     
            setDelVis({ drawer: false, main: false, [`${job}`]: false });
            renderModal("error", "DELETE");                 
            console.error('There was an error!', error);
        });
      
    };
   
    const handleCancel=(extraObject)=>{
        setConfirmLoading(false);
        console.log("Extra Object", extraObject);
        if(extraObject !=undefined){
            setDelVis({...delVisible, [`${extraObject}`]: false})
        }
        else{
            setDelVis({ drawer: false, main: false});
        }
        
    }

    const filterTable = (e, tableType)=>{
        const currValue = e.target.value;
        setValue(currValue);
        const filteredData = tableData.filter(entry => entry.jobName.includes(currValue));
        setDataSource(filteredData);
     }

    const columnSearchRender=(tableType)=>{
        return(
            <Col id="searchCol">
                <Row id="searchRow" justify="center" align="bottom">
                    <div>{tableType==="jobs"? "Job Name": "Audit Type"}
                        <Button
                            id="searchButton"
                            type="primary"
                            icon={<SearchOutlined id="searchIcon" />}                 
                            onClick={()=>{showSearch? setShowSearch(false):setShowSearch(true)}}
                        />
                    </div> 
                </Row>
                {showSearch?
                (<Row justify="center">
                    <Input
                    placeholder={`Search Job`}
                    value={value}
                    onChange={e => filterTable(e, tableType) }/>
                </Row>): null}
            </Col>
        )        
    }
    
    const renderModal=(status, reqType)=>{       
        if (status=="success"){
            Modal.success({
                title: <Row justify='center' align='middle'>{
                    reqType=="POST"? 
                    `${path[1]} ${path[1]!=="Configurations"? "Item":""} Creation- Successful` 
                    :(reqType=="PUT"||reqType=="PATCH")?`${path[1]} ${path[1]!=="Configurations"? "Item ":""} Successfully Modified`
                    :`${path[1]} ${path[1]!=="Configurations"? "Item ":""} Successfully Deleted`
                }</Row>,                 
                centered: true,
                icon: <Row justify='center' align='middle'><CheckCircleOutlined style={{ fontSize: '50px', color: '#52c41a' }}/></Row>,
                content: <Row justify='center' align='middle'> {`Click Ok to return to ${path[1]} Page`}</Row>,              
                okText: 'Ok',
                onOk: ()=>setItemAction(!itemAction),
               
            })
        }
        else if( status=="error"){
            Modal.error({
                title: <Row justify='center' align='middle'>{
                    reqType=="POST" && path[1]!=="login"? 
                    `${path[1]} ${path[1]!=="Configurations"? "Item ":""} Creation- Failed`
                    :(reqType=="POST" && path[1]=="login")? "Login attempt Failed"
                    :(reqType=="PUT"||reqType=="PATCH")?`${path[1]} ${path[1]!=="Configurations"? "Item ":""} could NOT be modified`
                    :`${path[1]} ${path[1]!=="Configurations"? "Item ":""} Could Not Be Deleted`
                }</Row>,
                                                     
                centered: true,
                icon: <Row justify='center' align='middle'><CloseCircleOutlined style={{ fontSize: '50px'}}/></Row>,
                content: <Row justify='center' align='middle'>{`Something Went Wrong \n Click Ok to return to ${path[1]} Page\n`}</Row>,                       
                okText: 'Ok',
                onOk: ()=>{routerPath.length<3? router.push(path[1]): router.push(router.pathname, `Operations/${path[1]}`)},
              
            })
        }
      
    }
  
    //fetches configuration from database 
    const getConfig = async() =>{
        const res =await fetch('http://localhost:5000/settingOperation')

        if (!res.ok) {
            // get error message from body or default to response status
           throw new Error("An error has occured");
        }
        else{
            const configData = await res.json();

            return configData;
            
        }
        
    }

    const reRoute=(link)=>{        
        window.open(link);       
    }  

    const dynamicRenders= async(configData, opIndex, popLinkIndex)=>{
        //var opRoutes=null;
        var navOpsList= null;
        var displayLinks= null;
        var getOperationData = null;
        var popLinkData= null;

        var fieldVals= {"Operation":[], "Link":[], "Model":[]};    
        if(settingsType==null){           
            // opRoutes =await configData[opIndex].data.map((op, index)=>{
            //     fieldVals.Operation.push(op.name);
            //     return(
            //         <ProtectedRoute key={`op-${index}`} path={`/${op.name}`}  component={ Operation }/>
            //     );            
            // });    
    
            navOpsList= await configData[opIndex].data.map((op, index)=>{
                fieldVals.Operation.push(op.name);
                return(
                    <Menu.Item key={`Op- ${index}`}> <Link href="/Operations/[Operation]" as={`/Operations/${op.name}`}><a>{op.name}</a></Link> </Menu.Item>
                );
            });
    
            displayLinks= await configData[popLinkIndex].data.map((popLink, index)=>{
                fieldVals.Link.push(popLink.name);
                return(
                    <Col key={`link-${index}`} lg={8} md={12} sm={12} xs={24}>                 
                        <Card id="AppCard" hoverable={true}>
                            <Row gutter={50} onClick={()=>reRoute(popLink.link)}>
                              <Col span={2}>
                                <Meta avatar={<Avatar size='large' icon={"nothing"}/>}/>                   
                              </Col>  
                              <Col span={18}>
                                <p id="popLinksLink"><a>{popLink.name}</a></p>   
                              </Col>
                            </Row>              
                                             
                        </Card>
                    </Col>
                )
            }) 
    
        }    

        if((settingsType!==null) && (typeof settingsType !== 'object')){             
            setOpType(prevPath);
            getOperationData= await configData[opIndex].data.find((op)=>op.name===settingsType)                     
        }
        else if((settingsType!=null) && (typeof settingsType === 'object')){                           
            popLinkData= await configData[popLinkIndex].data.find((link)=>link.name===settingsType.link)                     
        }
        else{
            getOperationData= configData[opIndex].data
            popLinkData= configData[popLinkIndex].data
        }    
        
        setDummyVal(fieldVals);

        return { navOpsList, displayLinks, getOperationData, popLinkData};
    }

    const checkOp=async()=>{
        let propTestString=null;
        console.log("current path is", path)
        const filteredOp= opData.filter((op)=>{
            return op.name===path[1];
        })
        console.log("Filtered Op", filteredOp)
        if(filteredOp.length!=0){
            let inputs=[];
            let fileTypes=[];
            if(["request_properties", "request_attachments"].every((key)=>Object.keys(filteredOp[0].request_template).includes(key))){
                inputs=filteredOp[0].request_template.request_attachments.filter((input)=>input.type==="input");
                inputs.forEach(input => {                    
                    fileTypes.push(`.${input.id}`);
                });
                setFileCount(inputs.length);
                otherFields= filteredOp[0].request_template.request_properties;
                setReqProps(filteredOp[0].request_template.request_properties)
                setInFiles(fileTypes);
                propTestString="both";
                return {propTestString, otherFields, "fileLength":inputs.length}
            }
            else if ("request_properties" in filteredOp[0].request_template){
                otherFields= filteredOp[0].request_template.request_properties;
                setReqProps(filteredOp[0].request_template.request_properties);
                propTestString=true;
                return {propTestString, otherFields}
            }
            else if ("request_attachments" in filteredOp[0].request_template){
                inputs=filteredOp[0].request_template.request_attachments.filter((input)=>input.type==="input");
                inputs.forEach(input => {                    
                    fileTypes.push(`.${input.id}`);
                });
                setFileCount(inputs.length);
                setInFiles(fileTypes);
                propTestString="fileOnly"
                return {propTestString, otherFields, "fileLength":inputs.length}
            }      
            else{
                propTestString="fileOnly"
                return {propTestString, otherFields}
            }             
        } 
    }

    const configSetUp=()=>{
        //console.log("The prev path is", settingsType)
        if(settingsType==null){
            getConfig()
            .then((configData)=> {
                const opIndex = configData.findIndex(settingObj=> settingObj.type === "operations_processes")
                const popLinkIndex = configData.findIndex(settingObj=> settingObj.type === "popular_links")
                setSettingData(configData)
                setId(configData[opIndex].id);
                setPopId(configData[popLinkIndex].id);            
                return dynamicRenders(configData, opIndex, popLinkIndex)
            })
            .then((renders)=>{
                let freqLinks= renders.displayLinks;
                console.log("Successful Renders", renders);
                setOperations(renders.navOpsList);
                //setRoutes(renders.opRoutes);            
                setPopLinks(freqLinks.sort((a,b)=>{  
                    const firstVal= a.props.children.props.children.props.children[1].props.children.props.children.props.children;
                    const secVal=  b.props.children.props.children.props.children[1].props.children.props.children.props.children;      
                    
                    if(firstVal > secVal){
                        return 1;
                    } 
                    else if(firstVal < secVal){
                        return -1;
                    }
                    else{
                        return 0;
                    }
                    
                }))
                setPopData(renders.popLinkData);
                setOpData(renders.getOperationData);
            
            })
            .catch(error => {               
                console.error('There was an error!', error);
            });   
        }
        else{
            console.log("Validate NOT NULL", settingsData)
            const opIndex = settingsData.findIndex(settingObj=> settingObj.type === "operations_processes")
            const popLinkIndex = settingsData.findIndex(settingObj=> settingObj.type === "popular_links")
            dynamicRenders(settingsData, opIndex, popLinkIndex)
            .then((renders)=>{ 
                console.log("Successful Renders", renders);               
                setPopData(renders.popLinkData);
                setOpData(renders.getOperationData);            
            })
            .catch(error => {               
                console.error('There was an error!', error);
            }); 
        }
        
    }

    const parseAttachName=(name)=>{
        console.log("The original Name is", name);
        let parsedName=null
        let regX = {
            "regex":/^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2}).(\d*)Z/,
            "replacer":""
        }    
    
        parsedName= name.replace(regX.regex, regX.replacer);
        const spaceRegX=/[\w]*%20[\w]*/
        if(spaceRegX.test(parsedName)){
            parsedName= parsedName.replace(/%20/g, " ");
        }
        console.log("The parsed Name is", parsedName);
        return parsedName;
    }
   
    //calls getConfig fxn once when components wrapped within this components are being mounted
    useEffect(()=>{      
        //console.log("Current Page Path", path[1]);       
       configSetUp();                       
    },[prevPath]) 
   
    return(
        <ConfigContext.Provider value={{ itemAction, setItemAction, dataSource, setDataSource, tableData, setTableData, columnSearchRender, modalVisible, setModalVisible, settingsType, setSettingType, dummyVal, configFieldsVal, setConfigVal, popLinksGrid, setPopGrid, layoutMargin, setLayoutMargin, headerGrid, setHeaderGrid, breakPoint, setBreakPoint, userId, setUserId, opPageOrigin, setOrigin, authenticated, setAuthenticated, otherFields, reqProps, inFiles, reqFileCount, setFileCount, checkOp, count, setCount, dateFormat, parseAttachName, handleCancel, confirmLoading, setConfirmLoading, delVisible, setDelVis ,handleOk, configSetUp, opType, router, operations, popLinks, path, form, prevPath, setPrevPath, opData, popId, opSettingsId, popLinksData, renderModal }}>
            {props.children}
        </ConfigContext.Provider>
    )
}

export default ConfigContextProvider;