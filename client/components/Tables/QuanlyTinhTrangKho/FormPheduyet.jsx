import React from 'react'
import { Form, Input, Button, Icon, Popconfirm, message } from 'antd';
import UploadFile from './../../UploadFile';
import {updateStateData} from 'actions'
const FormItem = Form.Item;

const QC_Check = "qc_check";

class FormPheduyet extends React.Component {
  verifyProduct(value) {
    let {phieunhap} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    
    let note, file;
    if(pheduyet.verifyType == QC_Check) {
      note = pheduyet.qc_note;
      file = pheduyet.qc_file;
    } else {
      note = pheduyet.qa_note;
      file = pheduyet.qa_file;
    }
    if(!note && !file) {
      message.error('Bạn hãy nhập thông tin phê duyệt hoặc tải file đính kèm!');
      return false;
    }
    
    this.props.changeStatus(pheduyet.verifyType, pheduyet.id, value, note, file);
  }
  render() {
    let {phieunhap} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    let qcFile,
        qaFile;
    if(pheduyet.id) {
      if(pheduyet.qc_file != "") {
        qcFile = [{
          uid: -1,
          name: pheduyet.qc_file,
          status: 'done',
          url: ISD_BASE_URL + 'upload/' + pheduyet.qc_file,
        }];
      }
      if(pheduyet.qa_file != "") {
        qaFile = [{
          uid: -1,
          name: pheduyet.qa_file,
          status: 'done',
          url: ISD_BASE_URL + 'upload/' + pheduyet.qa_file,
        }];
      }
    }
    return (
      <Form>
        {pheduyet.verifyType == QC_Check ? 
        <React.Fragment>
          <FormItem
            label="Nội dung phê duyệt">
            <Input.TextArea 
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qc_note: e.target.value
                    }
                  }
                }));
              }}
              value={pheduyet.qc_note} />
          </FormItem>
          <FormItem
            label="File đính kèm (nếu có)">
            <UploadFile
              fileList={qcFile ? qcFile : []}
              onDone={(filename) => {
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qc_file: filename
                    }
                  }
                }));
              }}
              mainState={this.props.mainState}
              dispatch={this.props.dispatch}/>
          </FormItem>
        </React.Fragment>
        : 
        <React.Fragment>
          <FormItem
            label="Nội dung phê duyệt">
            <Input.TextArea 
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qa_note: e.target.value
                    }
                  }
                }));
              }}
              value={pheduyet.qa_note} />
          </FormItem>
          <FormItem
            label="File đính kèm (nếu có)">
            <UploadFile
              fileList={qaFile ? qaFile : []}
              onDone={(filename) => {
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qa_file: filename
                    }
                  }
                }));
              }}
              mainState={this.props.mainState}
              dispatch={this.props.dispatch}/>
          </FormItem>
        </React.Fragment>
        }
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