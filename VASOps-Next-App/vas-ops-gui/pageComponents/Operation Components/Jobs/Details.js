//React native import
import { useContext, useState } from 'react';

//css imports

// import '../../../../scss/ComponentCss/OperationCss/jobDetails.css';

//Ant Design Native Components import
import { Table, Badge, Row, Col, Card, Tag, Button, Popconfirm } from 'antd';
import { ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';

//Custom Components import
//import ConfirmDelete from '../../../Global Components/ConfirmDelete';

import { ExpandableTableContext } from '../../../contexts/ExpandableTableContext';
//import { PopUpContext } from '../../../../contexts/PopUpContext';
import { DrawerContext } from '../../../contexts/DrawerContext';
import { ConfigContext } from '../../../contexts/ConfigContext';
//import { DrawerContext } from '../../contexts/DrawerContext';

//component renders added details corresponding to a job/operations item from the list of scheduled/submitted jobs
const ItemEntryDetail =()=> {

   
    const {data,  expandedRowRender, expandIcon, expandRowByClick, defaultExpandedRowKeys}=useContext(ExpandableTableContext);
    const {jobData, delRecord}=useContext(DrawerContext);
    const { handleCancel, handleOk, delVisible, setDelVis, confirmLoading}= useContext(ConfigContext);

    //defines the header for the Job Details Table
    const columns = [
        { title: 'Job Details', dataIndex: 'section', key: 'sections' }
    ]

    
    return (
        <div id="details">
            <Row>
                <Col span={24}>
                    <div id="jobDetailsTable">
                        <Table                            
                            className="components-table-demo-nested"
                            columns={columns}
                            expandable={{ defaultExpandedRowKeys, expandRowByClick, expandedRowRender, expandIcon }}
                            dataSource={data("Details")}
                            pagination={false}/>                            
                                
                    </div>      
                </Col>                       
            </Row>
            <Row justify='center'>
            <Popconfirm 
                id="popConfirm"
                title="Are you Sure?"
                placement="right"
                visible={delVisible.drawer}
                onConfirm={()=>handleOk(null, delRecord)}
                okButtonProps={{ loading: confirmLoading }}
                onCancel={handleCancel}>
                <Button id="cancelButton" type="primary" onClick={()=>setDelVis({drawer:true, main:false})}>
                    Delete Job
                </Button>                         
            </Popconfirm>
                
            </Row>                        
        </div>
        
    );
}

export default ItemEntryDetail