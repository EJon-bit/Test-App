import { useContext, useState } from 'react';

//custom css import
// import "../../scss/ComponentCss/GlobalCompCss/Drawer.css"

//UI library component import
import { Drawer } from 'antd';
import { DrawerContext } from '../../contexts/DrawerContext';

//import '../../less/drawer.less'
//import { ThemeContext } from '../../contexts/ThemeContext';
//import ConfigContext from '../contexts/ConfigContext'

const CustomDrawer=({ drawerWidth, placement })=>{
    
    const { visible, onClose, drawerIdentifier}=useContext(DrawerContext);
    //const {theme}= useContext(ThemeContext);
    
    return(
        <Drawer  
            destroyOnClose={true}
            id={`drawer-light-theme`}
            width={drawerWidth}
            placement={placement}
            closable={false}
            onClose={onClose}
            visible={visible}>  
                {drawerIdentifier}                              
        </Drawer>
    )
    

}

export default CustomDrawer