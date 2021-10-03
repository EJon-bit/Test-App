import { createContext, useContext, useState } from 'react';

import {PlusOutlined, MinusOutlined} from '@ant-design/icons';

import { FormTableContext } from './TableSubContexts/FormTableContext.js';
import { DetailsTableContext } from './TableSubContexts/DetailsTableContext.js';
import { DrawerContext } from './DrawerContext.js';

export const ExpandableTableContext= createContext();


const ExpandableTableContextProvider=(props)=>{
    const { formRowRender, formRowTitles } =useContext(FormTableContext);
    const { detailRowRender }= useContext(DetailsTableContext);
    const { auditOnly, detailRowTitles, setDetTitles }= useContext(DrawerContext);
    
    
    //stores object that defines the sections of the forms to Create/Modify a Job and the details corresponding to an "operation item"
    const data = (tableId)=>{        
       
        if(tableId==="Form"){
            return (
                formRowTitles         
            )
        }
        else if(tableId==="Details"){            
            return( 
                detailRowTitles
            )
        }
        
    }  

    //function renders specific section on the Job details based on which section was expanded by user
    const expandedRowRender = (record) => {  
            
        if(record.key.match(/Det\d/)){           
            return(detailRowRender(record))
        }
        else if(record.key.match(/Form\d/)){           
            return(formRowRender(record))                
        }        
    };

    const expandIcon=({ expanded }) =>
    expanded ? (
        <MinusOutlined />
    ) : (
        <PlusOutlined />
    )

    const expandRowByClick=true;
    const defaultExpandedRowKeys=['Form1', 'Det1'];

    return(
        <ExpandableTableContext.Provider value={{ defaultExpandedRowKeys, expandRowByClick, expandIcon, expandedRowRender, data }}>
            {props.children}
        </ExpandableTableContext.Provider>
    )
}

export default ExpandableTableContextProvider