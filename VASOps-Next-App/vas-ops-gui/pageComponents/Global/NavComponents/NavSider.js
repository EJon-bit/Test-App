import { useContext, useState } from 'react';


import {Layout} from 'antd';


import NavMenu from './NavMenu' ;
import { ConfigContext } from '../../../contexts/ConfigContext';

const { Sider } = Layout;


const SiderNav=()=> { 

  
  const [collapsed, setCollapsed]= useState(false);
  const {setHeaderGrid, setLayoutMargin}= useContext(ConfigContext);
  const defaultHeaderGrid= {
    componentSize:{
      lgTitle:6,
      lgMenu:6
    },
    componentOffset:{
        titleOffset:7,
        menuOffset:4
    }
  }
  
  const onCollapse = (collapsed, type) => { 
    console.log("Sider Status", type);  
    if(collapsed){
      setHeaderGrid({
        componentSize:{
          lgTitle:6,
          lgMenu:6
        },
        componentOffset:{
            titleOffset:9,
            menuOffset:6
        }
      }) ;
      setLayoutMargin(0);
    }
    else if(!collapsed){
      setHeaderGrid(defaultHeaderGrid);
      setLayoutMargin(250);
    }
    setCollapsed(collapsed);
  };

 
  var siderProps={
    collapsible: true,
    collapsed: collapsed,
    onCollapse: onCollapse, 
    collapsedWidth: 0,     
    theme:"light",      
    width:250
  }
 
  return (      
      <Sider theme="light" id="sider" {...siderProps}>
        <NavMenu/>
      </Sider>      
  );

}


export default SiderNav;

