import { useContext, useState } from 'react';
//import '../../less/modal.less'
//UI library component import
import { Modal } from 'antd';
import { ConfigContext } from '../../contexts/ConfigContext';


const CustomModal=({title, modalText})=>{

    const {modalVisible, setModalVisible}= useContext(ConfigContext);
    return(
        <Modal
        id="jobsAuditModal"
        title={title}
        centered
        destroyOnClose={true}
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={1000}    >
                {modalText}
        </Modal>
    )
   

}

export default CustomModal
    