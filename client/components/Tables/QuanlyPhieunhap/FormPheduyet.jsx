import React from 'react'
import { Form, Input, Button, Icon, Popconfirm, message } from 'antd';
import UploadFile from './../../UploadFile';
import {updateStateData} from 'actions'
const FormItem = Form.Item;

class FormPheduyet extends React.Component {
  verifyProduct(value) {
    let {phieunhap} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    if(!pheduyet.note && !pheduyet.file) {
      message.error('Bạn hãy nhập thông tin phê duyệt hoặc tải file đính kèm!');
      return false;
    }
    this.props.changeStatus(pheduyet.verifyType, pheduyet.id, value, pheduyet.note, pheduyet.file);
  }
  render() {
    let {phieunhap} = this.props.mainState;
    let {ans_language} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    return (
      <Form>
        <FormItem
          label={ans_language.ans_approval_content || 'ans_approval_content'}
          //labelCol={{ span: 12 }}
          //wrapperCol={{ span: 12 }}
        >
          <Input.TextArea 
            autosize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  pheduyet: {
                    ...this.props.mainState.phieunhap.pheduyet,
                    note: e.target.value
                  }
                }
              }));
            }}
            value={pheduyet.note} />
        </FormItem>
        <FormItem
          label={ans_language.ans_attach_file_option || 'ans_attach_file_option'}
          //labelCol={{ span: 12 }}
          //wrapperCol={{ span: 12 }}
        >
          <UploadFile
            fileList={[]}
            onDone={(filename) => {
              this.props.dispatch(updateStateData({
                phieunhap: {
                  ...this.props.mainState.phieunhap,
                  pheduyet: {
                    ...this.props.mainState.phieunhap.pheduyet,
                    file: filename
                  }
                }
              }));
            }}
            mainState={this.props.mainState}
            dispatch={this.props.dispatch}/>
        </FormItem>
        <FormItem>
          <Popconfirm
            title={ans_language.ans_confirm_approval || 'ans_confirm_approval'}
            onConfirm={() => this.verifyProduct(1)}>
              <Button type="primary" style={{marginRight: 10}}>
              <Icon type="check-circle" /> {ans_language.ans_approval || 'ans_approval'}     
            </Button>
          </Popconfirm>
          <Popconfirm
            title={ans_language.ans_confirm_not_approval || 'ans_confirm_not_approval'}
            onConfirm={() => this.verifyProduct(0)}>
              <Button type="danger" ghost>
                <Icon type="exclamation-circle" />{ans_language.ans_not_approval || 'ans_not_approval'}        
              </Button>
          </Popconfirm>
        </FormItem>
      </Form>
    );
  }
}

export default FormPheduyet;