import  { createContext, useContext, useState } from 'react';

//text Editor
//import Editor from '@monaco-editor/react';

//Custom Component imports
import CreateRequest from '../pageComponents/Operation Components/CreateJob';
import ItemEntryDetail from '../pageComponents/Operation Components/Jobs/Details';
import SettingsEditor from '../pageComponents/Config/SettingsEditor';
import ExpandableTableContextProvider from './ExpandableTableContext';

//import PopUpContextProvider from './PopUpContext';
import FormTableContextProvider from './TableSubContexts/FormTableContext';
import DetailsTableContextProvider from './TableSubContexts/DetailsTableContext';
import ThemeContextProvider from './ThemeContext';

import ConfigContextProvider, { ConfigContext } from './ConfigContext';
import NavMenu from '../pageComponents/Global/NavComponents/NavMenu';


export const DrawerContext= createContext();
let drawerIdentifier= null;
let deleteIdentifier= null

const DrawerContextProvider=(props)=>{
    const {setSettingType, prevPath, setPrevPath}= useContext(ConfigContext);
    const [visible, setVisible]= useState(false)
    const [jobData,setJobData]=useState(null);
    const[jobAudits, setJobAudits]=useState();   
    const [delRecord, setDelRecord]=useState();
    const [navDrawer, setNavDrawer]= useState(false);
    const[drawerWidth, setDrawerWidth]=useState({
        "settingsDrawer": 750,
        "opDrawer":650
    }); 
    const [detailRowTitles, setDetTitles]=useState([   
        {
            key: 'Det4',
            section:'Audit Logs'
        },   
        {
            key:'Det1',
            section:'General Entry Details'
        }
    ])
  
    const[jobs,setJobs]= useState(); 
    const[auditOnly,setAuditOnly]= useState(false); 
    /*mounts content to be displayed in Drawer Component when a button is pressed to create/modify a job, edit app configurations or see added details*/
    const showDrawer = (trigger, data) => {
        console.log(trigger);
        
        if(trigger==="New Job"){
            setNavDrawer(false);
            setJobData(null);
            drawerIdentifier=          
            <DetailsTableContextProvider>
                <FormTableContextProvider>
                    <ExpandableTableContextProvider>
                        <CreateRequest reqType={data}/>
                    </ExpandableTableContextProvider>  
                </FormTableContextProvider>
            </DetailsTableContextProvider>           
                                                                   
        }
        else if(trigger==="Modify Job"){
            setNavDrawer(false);
            setJobData(data); 
            drawerIdentifier= 
            <DetailsTableContextProvider>
                <FormTableContextProvider>
                    <ExpandableTableContextProvider>
                        <CreateRequest reqType={data}/>
                    </ExpandableTableContextProvider>  
                </FormTableContextProvider>
            </DetailsTableContextProvider> ;
             
        }       
        else if(trigger==="Job Details"){
            setNavDrawer(false);
            setJobData(data);
            drawerIdentifier=
            <DetailsTableContextProvider>
                <FormTableContextProvider>
                    <ExpandableTableContextProvider>                        
                        <ItemEntryDetail/>                                                              
                    </ExpandableTableContextProvider>
                </FormTableContextProvider>
            </DetailsTableContextProvider>
                   
        }
        else if(trigger.match(/[a-zA-Z]\s(Op|Link|Model)/s)){
            setNavDrawer(false);
            if(data==null){
               
                if(trigger==="Add/Edit/Del Links"){
                    drawerIdentifier=  <ThemeContextProvider><SettingsEditor change={true}/></ThemeContextProvider>
                }
                else if(trigger="Add/Edit/Del Ops"){
                    drawerIdentifier=  <ThemeContextProvider><SettingsEditor change={false}/></ThemeContextProvider>
                }                
            }
            else{            
                if(trigger==="Edit Link" || trigger==="Del Link"){
                    drawerIdentifier=  <ThemeContextProvider><SettingsEditor change={true}/></ThemeContextProvider>
                }
                else{
                    drawerIdentifier=  <ThemeContextProvider><SettingsEditor change={false} data={data}/></ThemeContextProvider>
                }
               
            }
            
        }
        else if(trigger==="Navbar"){
            setNavDrawer(true);
            drawerIdentifier= <NavMenu/>
        }
        else if(trigger==="Compare"){
            drawerIdentifier=  <ThemeContextProvider><SettingsEditor change={"compare"}/></ThemeContextProvider>
        }
        
        setVisible(true);
        console.log("Drawer Identifier is", drawerIdentifier);
    };

    //to unmount drawer
    const onClose = () => {
        setSettingType(null);
        setPrevPath(!prevPath)
        console.log("Closing")
        setVisible(false);        
    };

    return(
        <DrawerContext.Provider value={{ detailRowTitles, setDetTitles, auditOnly, setAuditOnly, jobs, setJobs, drawerWidth, setDrawerWidth, navDrawer, delRecord, setDelRecord, showDrawer, drawerIdentifier, visible, onClose, jobData, setVisible, setJobAudits, jobAudits }}>
            {props.children}
        </DrawerContext.Provider>
    )
}


export default DrawerContextProvider