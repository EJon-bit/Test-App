import { useContext, useEffect, useState } from 'react';
import Link  from 'next/link';

import { Menu } from 'antd';
import { DeploymentUnitOutlined, BellOutlined, MoneyCollectOutlined, BuildOutlined, SettingOutlined, LinkOutlined, ToolOutlined} from '@ant-design/icons';

import { ConfigContext } from '../../../contexts/ConfigContext';
import { ThemeContext } from '../../../contexts/ThemeContext';

const { SubMenu } = Menu;

const NavMenu=()=>{
   // const {changeTheme, theme} = useContext(ThemeContext);
    const { operations }= useContext(ConfigContext);

    const [navTheme, setNavTheme]=useState("dark");

    // useEffect(()=>{
    //     if(theme==="dark-theme"){
    //       setNavTheme("dark");
    //     }
    //     else if(theme==="light-theme"){
    //       setNavTheme("light");
    //     }     
       
    // },[theme]);

    return (
        <div id="navMenu">
            <div id="navLogo" className="logo"/> 
               
            <div id="menuContainer">
                <Menu defaultSelectedKeys={['1']} mode="inline">          
               
                    <Menu.Item key="2" icon={<BellOutlined style={{fontSize:'20px'}}></BellOutlined>}>              
                        <Link href="/Notifications">                              
                            <a>Notifications</a>
                        </Link>
                    </Menu.Item>
                    
                    <Menu.Item key="5" icon={<LinkOutlined style={{fontSize:'20px'}}/>}>
                        <Link href="/PopularLinks"><a>Popular Links</a></Link>
                    </Menu.Item>
                
                    <SubMenu key="sub1" icon={<BuildOutlined style={{fontSize:'20px'}}/>} title="Available Operations">
                        {operations}
                    </SubMenu>             
                    
                    <Menu.Item key="11" icon={<SettingOutlined style={{fontSize:'20px'}}/>}>
                        <Link href="/Configurations"><a>Configurations</a></Link>
                    </Menu.Item>                            
                </Menu>      
            </div>           
        </div>
 
    )
}

export default NavMenu;

