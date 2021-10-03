//imports from React
import { useContext } from 'react';
// import {withRouter} from 'react-router-dom';


//Custom Component Imports
import SubmittedJobs from '../../pageComponents/Operation Components/Jobs/SubmittedJobs';

import {ConfigContext} from '../../contexts/ConfigContext';
import { DrawerContext } from '../../contexts/DrawerContext';



const Operation=()=>{

    const { drawerWidth }=useContext(DrawerContext);
    const { router }= useContext(ConfigContext);
    // const { data:session , status } = useSession({
    //     required: true,
    //     // onUnauthenticated() {
    //     //   // The user is not authenticated, handle it here.
    //     // }
    // })
    

    return(       
        <div id="operation">                               
            <SubmittedJobs/>  
        </div>
    );     
}

export default Operation;

Operation.auth=true;