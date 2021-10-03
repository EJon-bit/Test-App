//React native imports
import React, { useState } from 'react';


import {Button, Card, Col, Row, Steps} from 'antd';


const { Step } = Steps;
const { Meta }=Card;

const CurrentJobs=()=>{

    const[jobs,setJobs]=useState([
        {
            name:"Job 1",
            description:"ifjvin nyugy",
            steps:[
                {
                    name:"MINSAT",
                    description:"Parsing X, producing Y",
                    percent:null,
                    current:null,
                },
                {
                    name:"SDP",
                    description:"Parsing X, producing Y",
                    percent:null,
                    current:null,
                },
                {
                    name:"EMA",
                    description:"Parsing X, producing Y",
                    percent:null,
                    current:null,
                }
            ]
        }
        
    ])
   
    
    const displaySteps= jobs[0].steps.map((step, index)=>{
        return(
            <Step key={`step ${index}`} title={step.name} description={step.description} />
        )
    })
    const displayJobs= jobs.map((job, index)=>{
        return(
            <Col key={`jobCol-${index}`} span={24}> 
                <Card 
                    id="JobCard"                    
                    actions={[
                        <Steps current={2} percent={60}>
                            {displaySteps}
                        </Steps>]}>
                    <Meta title={job.name}/>
                    <p>{job.description}</p>
                    
                </Card>
            </Col>
        );
    });
    
    return(
        <div>
            <Card title="Current Jobs">
                <Row gutter={[24,10]}>
                    {displayJobs}
                </Row> 
                              
            </Card>
        </div>
        
    );
}


export default CurrentJobs;