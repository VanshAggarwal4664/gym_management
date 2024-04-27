import { Card, CardHeader, CardBody, CardFooter, Heading, Text} from '@chakra-ui/react'

import './features.css'
const Feature=()=>{
    return (
        <div className='feature-section'>
         <div className='feature-heading'>
            <Heading className='mirror-text' data-content= "Features" fontSize={70} >Our Features</Heading>
         </div>
    
        <div className='feature-content'>
           <Card minH={240} className='feature'>
            <CardHeader>
                <img className='icon' src="src\assets\check-list-clipboard-list-svgrepo-com.svg" width="60px" height="60px" alt="" />
            </CardHeader>
            <CardBody>
                <Heading fontSize={30} pt={4} pb={4}>Effortless Attendance</Heading>
                <Text fontSize={18} >Track member attendance effortlessly for streamlined operations.</Text>
            </CardBody>
           </Card>

           <Card minH={240} className='feature'>
            <CardHeader>
                <img src="src\assets\business-expense-svgrepo-com.svg" width="60px" height="60px" alt="" />
            </CardHeader>
            <CardBody>
                <Heading fontSize={30} pt={4} pb={4}>Expense Management</Heading>
                <Text fontSize={18}>Easily manage gym finances for optimized budgeting and spending analysis.</Text>
            </CardBody>
           </Card>

           <Card minH={220} className='feature'>
            <CardHeader>
                <img src="src\assets\message-text-svgrepo-com.svg" width="60px" height="60px" alt="" />
            </CardHeader>
            <CardBody>
                <Heading fontSize={30} pt={4} pb={4}>Personalized Messaging</Heading>
                <Text fontSize={18}>Stay connected with members through targeted announcements and reminders.</Text>
            </CardBody>
           </Card>

           <Card minH={240} className='feature'>
            <CardHeader>
                <img src="src\assets\analytics-svgrepo-com.svg" width="60px" height="60px" alt="" />
            </CardHeader>
            <CardBody>
                <Heading fontSize={31} pt={4} pb={4}>Insightful Reporting</Heading>
                <Text fontSize={18}>Gain actionable insights into gym performance with comprehensive reports.</Text>
            </CardBody>
           </Card>
        </div>
    </div>
  
    )
}

export default Feature;