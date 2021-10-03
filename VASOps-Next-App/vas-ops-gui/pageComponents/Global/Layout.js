import { useContext, useEffect, useState } from 'react';;

import { ConfigContext } from '../../contexts/ConfigContext';
import CustomDrawer from './Drawer';
import SiderNav from './NavComponents/NavSider';
import {DrawerContext} from '../../contexts/DrawerContext';

import { PlusOutlined, SettingOutlined, UserOutlined, MenuOutlined} from '@ant-design/icons';

import {Grid, Layout, Menu, Tooltip, Avatar, Row, Col, Button} from 'antd';



const { useBreakpoint } = Grid;


//defines Sub-Components of Antd native- Layout Component
const {Header, Content}= Layout;
const { SubMenu } = Menu;


const PageLayout = ({children}) => {
    const {  prevPath, setSettingType, setHeaderGrid, setPopGrid, layoutMargin, setLayoutMargin, headerGrid, breakPoint, setBreakPoint, userId, authenticated, setAuthenticated, path, setPrevPath, setOrigin, history}= useContext(ConfigContext);    
    const { drawerWidth, setDrawerWidth, navDrawer, showDrawer }=useContext(DrawerContext);
    const screens = useBreakpoint();
    
    //mounts drawer component if "Create Job" button is clicked and mounts Config Page if "Edit Configuration" button is clicked 
    const handleClick=({key})=>{
        console.log("Key", key)
        if(key==="create"){
            showDrawer("New Job", "post")
        }
        else if(key==="set"){
            setOrigin(true);
            setPrevPath(!prevPath);
            setSettingType(path[1]);
            showDrawer("Edit Op", "Configs");              
        }
       
    }    
  
    //Changes the header features rendered/mounted based on route path 
    const headerContent =() =>{               
        //console.log("The path is", path)
        return(
            <Header id="menuHead">
                <Row align="middle" id="headerRow" wrap={false}>
                    {breakPoint==="xl" || breakPoint==="xxl"?
                        null
                        :(<Col md={1} offset={1}>
                            <Button id="drawerTrigger" onClick={()=> showDrawer("Navbar", null)} icon={<MenuOutlined/>} size="small"/>
                        </Col>)                    
                    }

                    {breakPoint!=="xs" && breakPoint!=="sm"?
                        <Col  id="pageTitle" lg={headerGrid.componentSize.lgTitle}  md={8} offset={headerGrid.componentOffset.titleOffset}>
                            <div id="ops" key="op">{path[1]!==""? path[1]: "Home"} </div>
                        </Col>
                        :null
                    }
                    
                    <Col id="menuButtons" lg={headerGrid.componentSize.lgMenu}  md={3} offset={headerGrid.componentOffset.menuOffset}>
                        <Menu id="menu" onClick={handleClick} mode="horizontal">  
                            {   path[1]!=="" && path[1]!=="Notifications" && path[1]!=="PopularLinks" && path[1]!=="Configurations"?                              
                               (<>
                                    <Menu.Item id="addJob" key="create" icon={<Tooltip title="Create a Job"><PlusOutlined id="plusIcon"/></Tooltip>}/>
                                    <Menu.Item id="configs" key="set" icon={<Tooltip title="Edit Configuration"><SettingOutlined  id="configIcon"/></Tooltip>}/>                                                                                            
                                </>) : (<>
                                    <Menu.Item/> 
                                    <Menu.Item/>
                                    <Menu.Item/>                                                       
                                </>)                     
                            }   
                            <SubMenu id="userAcc" key="user" icon={ 
                                <Avatar 
                                    style={{ background: 'white' }} 
                                    icon={<UserOutlined id="userIcon"/>}/>}>  
                                    <Menu.ItemGroup title={userId}>
                                        <Menu.Item key="preferences">User Preferences</Menu.Item>
                                        <Menu.Item key="activityLogs">See Activity Logs</Menu.Item>
                                    </Menu.ItemGroup>                                   
                            </SubMenu>                  
                        </Menu>
                    </Col>               
                   
                </Row>
                {   !navDrawer?
                        <CustomDrawer drawerWidth={drawerWidth.opDrawer} placement="right"/> 
                    :null  
                }    
                                      
            </Header>                   
        )
        
    }

    useEffect(()=>{
        //login();       
        const breakpoints= Object.entries(screens).filter(screen=> screen[1])
        const point= Object.keys(Object.fromEntries(breakpoints))[breakpoints.length-1]
        setBreakPoint(point);
        console.log("the point is ", point);
        if(point!=="xl" && point!=="xxl"){
            setLayoutMargin(0);
            setPopGrid({
                rowProps:{justify:"center", gutter:[0,20]},
                colProps:{ 
                    popTitle:{},
                    searchBar:{}
                }
            })            
          
            if(point==="md"){
                setHeaderGrid({...headerGrid,               
                    componentOffset:{
                        titleOffset:6,
                        menuOffset:6
                    }
                });
                setDrawerWidth({
                    "settingsDrawer": 750,
                    "opDrawer":650
                })
            }
            else if(point ==="xs"){
                setHeaderGrid({...headerGrid,               
                    componentOffset:{
                        titleOffset:0,
                        menuOffset:12
                    }
                });
                setDrawerWidth({
                    "settingsDrawer": 350,
                    "opDrawer":350
                })
            }
            else if(point==="sm"){
                setHeaderGrid({...headerGrid,               
                    componentOffset:{
                        titleOffset:0,
                        menuOffset:20
                    }
                });
                setDrawerWidth({
                    "settingsDrawer": 450,
                    "opDrawer":450
                })
            }
           
        }
        else if(point==="xl" || point==="xxl"){
            setLayoutMargin(250);
            setPopGrid({
                rowProps:{},
                colProps:{
                    popTitle:{offset:8},
                    searchBar:{offset:3}
                }
            })          
            setHeaderGrid({
                componentSize:{
                    lgTitle:6,
                    lgMenu:6
                },
                componentOffset:{
                    titleOffset:7,
                    menuOffset:4
                }
            });
            setDrawerWidth({
                "settingsDrawer": 750,
                "opDrawer":650
            })
        }
    },[screens])

    return ( 
        <Layout id='appContainer'>                      
        {breakPoint==="xl" || breakPoint==="xxl"? <SiderNav/>: navDrawer? <CustomDrawer drawerWidth={250} placement="left"/>:null }

            <Layout id="contentLayout" className="site-layout" style={{ marginLeft: layoutMargin }}> 
                
                {headerContent()} 

                <Content id='componentContainer'>  
                    {children}
                </Content> 
                
                <div id="logo"/>                                                                       
            </Layout>  
        </Layout> 
    );
}
 
export default PageLayout;