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
    let pheduyet = phieunhap.pheduyet || {};
    return (
      <Form>
        <FormItem
          label="Nội dung phê duyệt"
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
          label="File đính kèm (nếu có)"
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
            title="Bạn chắc chắn muốn duyệt?"
            onConfirm={() => this.verifyProduct(1)}>
              <Button type="primary" style={{marginRight: 10}}>
              <Icon type="check-circle" /> Phê Duyệt Đạt         
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn chắc chắn muốn duyệt?"
            onConfirm={() => this.verifyProduct(0)}>
              <Button type="danger" ghost>
                <Icon type="exclamation-circle" /> Phê Duyệt Không Đạt         
              </Button>
          </Popconfirm>
        </FormItem>
      </Form>
    );
  }
}

export default FormPheduyet;