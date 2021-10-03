//React native imports
import {useContext, useState} from 'react';
//import {Route} from 'react-router-dom';

//css imports

// import '../scss/PagesCss/PopLinks.css';
import { ConfigContext } from '../contexts/ConfigContext';

//UI library Components import
import { Card, Row, Col,Input } from 'antd';
;

const {Search}= Input;

const PopularLinks=() =>{

    const { popLinksGrid, popLinks } = useContext(ConfigContext);
    const [popValue, setPopValue]=useState(popLinks);

    const onSearch=(value)=>{
        console.log("The value is,", value);
        setPopValue(value);
        const filteredData = popLinks.filter(link => link.props.children.props.children.props.children[1].props.children.props.children.props.children.includes(value));
        if(value!==""){            
            setPopValue(filteredData);
        }
        else{ 
            setPopValue(popLinks);
        }
    }

   const titleRender=()=>{
       return(
           <Row {...popLinksGrid.rowProps}>
               <Col lg={8} sm={24}  {...popLinksGrid.colProps.popTitle}> Frequently Visited Network Apps </Col> 
               <Col lg={5} sm={24} {...popLinksGrid.colProps.searchBar}>
                    <Search placeholder="Search Popular Links" onSearch={onSearch} style={{ width: 200 }}/>
               </Col>
           </Row>
       )
   }
    
    return(
        <div id="popLink">
            <Card id="wrapperCard" title={titleRender()}>                
                <Row gutter={45} justify="center">                        
                    {popValue}
                </Row>                   
            </Card>
        </div>
    );
}     
 
export default PopularLinks;

PopularLinks.auth=true;