
import { useState } from 'react';
//import CustomScroller from 'react-custom-scroller'
//css imports

// import '../scss/PagesCss/Notifications.css'

//UI library imports
import {Alert, Card, Row, Col, Popconfirm, Button} from 'antd';

var Notifications=()=>{
    const[visible, setVisible]=useState(false)
    const [confirmLoading, setConfirmLoading]=useState(false)
    const [snmpAlerts, setAlerts]= useState([
        {
            alertType:"error",
            source:"AIR",
            message:"This Device is experiencing issues",
        },
        {
            alertType:"success",
            source:"HLR",
            message:"This alert was successfully formed",
        }
    ])
    
    const[generalNotices,SetNotices]=useState([
        {                
            alertType:"info",
            source: "Database Add", 
            message:"Something was jus changed",
        },
        {
            alertType:"info",
            source: "Database Delete",
            message:"Something was deleted",
        }
    ])
   

    const showPopconfirm = visible => {
        setVisible(true);
    };

    const handleOk = confirmLoading => {
        setConfirmLoading(true);
        setTimeout(() => {
            setConfirmLoading(false);            
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setVisible(false);
    }; 

    const snmpAlertDisplay= snmpAlerts.map((alert, index) =>{
        return(
            <Alert
                key={`Alert-${index}`}
                message={alert.source}
                description={alert.message}
                type={alert.alertType}
                showIcon/>
        );
    });

    const noticeDisplay= generalNotices.map((notice, index) =>{
        return(
            <Alert
                key={`Notice-${index}`}
                message={notice.source}
                description={notice.message}
                type={notice.alertType}
                showIcon/>
        );
    });
    
    return(
       
        <Col  span={24} id="Notifs">
            <Card title="SNMP Alerts">
                <Row justify="center">
                    <Col flex={5}>                        
                        {snmpAlertDisplay}                   
                    </Col>
                </Row>    
                <Row id="buttonRow" justify="center">
                    <Popconfirm id="popConfirm"
                        title="Are you Sure?"
                        placement="left"
                        visible={visible}
                        onConfirm={handleOk}
                        okButtonProps={{ loading: confirmLoading }}
                        onCancel={handleCancel}>
                        <Button id="notifButton" type="primary" onClick={showPopconfirm}>
                            Clear Alerts
                        </Button>
                    </Popconfirm>
                
                </Row>
            </Card>

            <Card title="General Notifications">                  
                <Row gutter={[24,24]}>
                    <Col flex={5}>                        
                        {noticeDisplay}                          
                    </Col>
                </Row>   
            </Card>
        </Col>
       
       
    );
}


export default Notifications;

Notifications.auth=true;