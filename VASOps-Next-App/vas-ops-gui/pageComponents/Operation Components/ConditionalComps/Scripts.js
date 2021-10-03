//React native imports
import React, { useContext, useState } from 'react' 
import Link from 'next/link';

//UI Library (Ant Design) Import
import { EditOutlined, EllipsisOutlined, SettingOutlined, DeleteOutlined, FileAddOutlined, InteractionOutlined} from '@ant-design/icons';
import {Row, Col, Dropdown, Menu, Card, Drawer, Button} from 'antd';

//Custom Component Import
import { ConfigContext } from '../../../contexts/ConfigContext';


const { Meta } = Card;

const Scripts=()=>{

    const {showDrawer}= useContext(ConfigContext)
    const [scripts, setScripts]= useState([
        {
            name:"Script Name",
            description:"Parses X and Produces Y",
            nodeLocation:"MINSAT",
            content:"iuiujm",
            readOnly:true,
            attachments:{
                inputs:[{

                }],
                outputs:[{

                }]
            }
        },
        {
            name:"Script Name",
            description:"sauihfjcm",
            nodeLocation:"EMA",
            content:"iuiujm",
            readOnly:false,
            attachments:{
                inputs:[{

                }],
                outputs:[{

                }]
            }
        },
        {
            name:"Script Name",
            description:"sauihfjcm",
            nodeLocation:"EMA",
            content:"iuiujm",
            readOnly:false,
            attachments:{
                inputs:[{

                }],
                outputs:[{

                }]
            }
        }
    ])

    const menu = () =>{
        return(
            <Menu onClick={()=> showDrawer("Script Actions")}>
                <Menu.Item key="1" icon={<FileAddOutlined />}>
                Attachments
                </Menu.Item>
                <Menu.Item key="2" icon={<InteractionOutlined />}>
                Related Jobs
                </Menu.Item>
                <Menu.Item key="3" icon={<DeleteOutlined />}>
                Remove Script
                </Menu.Item>
            </Menu>
        )
    }
    
            
    const showFiles = scripts.map((script, index) =>{
        return(
            <Col key={`attach-${index}`} span={8}>                        
                <Card id="attachments"                                                           
                    actions={[                                                                                                 
                        <EditOutlined onClick={()=>showDrawer("Edit Script")} key="edit" />,                                                  
                        <Dropdown overlay={menu}>
                            <EllipsisOutlined id="ellipsisIcon" key="ellipsis"/>
                        </Dropdown>,
                        <Link id="configLink" to="/config"><SettingOutlined id="settingsIcon" key="setting" /></Link>                                                                  
                    ]}>
                    <Meta                            
                        title={script.name}
                        description={`${script.description} \n Location: ${script.nodeLocation}`}/>
                </Card>                     
            </Col>
        );
    
    });    

    return(
        
        <Card title="Scripts">
            <Row gutter={35}>                                      
                {showFiles}
            </Row>    
        </Card>
       
       
    )
}

export default Scripts