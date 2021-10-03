import { useContext } from 'react';

import { providers, signIn, getSession, csrfToken } from "next-auth/react";

import { Col, Card, Row, Avatar, Form, Button, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined} from '@ant-design/icons';

const Login =({providers})=>{
   
    const onFinish = (values) => {
        console.log('Received values of form: ', values);

        const requestOptions={
            method: 'POST',                      
            body: JSON.stringify(values),
            headers: { 'Content-Type': 'application/json' }
        } 

        //post value to backend to be authenticated
        fetch('http://localhost:5000/login', requestOptions)
        .then(async res => {
            const data = await res.json();
            
            // check for error response
            if (!res.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || res.status;
                return Promise.reject(error);
            }
            else{              
                console.log(data);
                setUserId(values.username);
                setAuthenticated(true);                
                props.history.push('/');
            }

            
        })
        .catch(error => {       
            renderModal("error", 'POST');        
            console.error('There was an error!', error);
        });
       
    };

    const titleRender=()=>{
        return(
            <div id="navLogo" className="logo"/> 
        )
    }
    
    return(
        <div id="loginBackground">
            <Card id="loginCard" title={titleRender()}>
                <Form
                name="normal_login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}>
                    <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}>
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}>
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"/>
                    </Form.Item>                  
                    <Form.Item>
                        <Button id="loginButton" type="primary" htmlType="submit" className="login-form-button">
                            Login
                        </Button>
                      
                    </Form.Item>
                </Form>
            </Card>
        </div>       
    )
}

export default Login