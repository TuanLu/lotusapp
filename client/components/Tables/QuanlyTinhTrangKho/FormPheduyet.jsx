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
    let {ans_language} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    let qcFile,
        qaFile;
    if(pheduyet.id) {
      if(pheduyet.qc_file != "") {
        qcFile = pheduyet.qc_file.split(',').map((file) => {
          return {
            uid: file,
            name: file,
            status: 'done',
            url: ISD_BASE_URL + 'upload/' + file,
          }
        });
      }
      if(pheduyet.qa_file != "") {
        qaFile = pheduyet.qa_file.split(',').map((file) => {
          return {
            uid: file,
            name: file,
            status: 'done',
            url: ISD_BASE_URL + 'upload/' + file,
          }
        });
      }
    }
    return (
      <Form>
        {pheduyet.verifyType == QC_Check ? 
        <React.Fragment>
          <FormItem
            label={ans_language.ans_approval_content || 'ans_approval_content'}>
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
            label={ans_language.ans_attach_file_option || 'ans_attach_file_option'}>
            <UploadFile
              fileList={qcFile ? qcFile : []}
              onDone={(filename) => {
                let files = this.props.mainState.phieunhap.pheduyet.qc_file;
                if(files != '') {
                  files += `,${filename}`;
                } else {
                  files = filename;
                }
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qc_file: files
                    }
                  }
                }));
              }}
              onRemove={(filename) => {
                let files = this.props.mainState.phieunhap.pheduyet.qc_file;
                if(files != '') {
                  files = files.split(',').filter((file) => file != filename);
                  files = files.join(',');
                }
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qc_file: files
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
            label={ans_language.ans_approval_content || 'ans_approval_content'}>
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
            label={ans_language.ans_attach_file_option || 'ans_attach_file_option'}>
            <UploadFile
              fileList={qaFile ? qaFile : []}
              onDone={(filename) => {
                let files = this.props.mainState.phieunhap.pheduyet.qa_file;
                if(files != '') {
                  files += `,${filename}`;
                } else {
                  files = filename;
                }
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qa_file: files
                    }
                  }
                }));
              }}
              onRemove={(filename) => {
                let files = this.props.mainState.phieunhap.pheduyet.qa_file;
                if(files != '') {
                  files = files.split(',').filter((file) => file != filename);
                  files = files.join(',');
                }
                this.props.dispatch(updateStateData({
                  phieunhap: {
                    ...this.props.mainState.phieunhap,
                    pheduyet: {
                      ...this.props.mainState.phieunhap.pheduyet,
                      qa_file: files
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
            title={ans_language.ans_confirm_approval || 'ans_confirm_approval'}
            onConfirm={() => this.verifyProduct(1)}>
              <Button type="primary" style={{marginRight: 10}}>
              <Icon type="check-circle" />{ans_language.ans_approval || 'ans_approval'}      
            </Button>
          </Popconfirm>
          <Popconfirm
            title={ans_language.ans_confirm_approval || 'ans_confirm_approval'}
            onConfirm={() => this.verifyProduct(0)}>
              <Button type="danger" ghost>
                <Icon type="exclamation-circle" />{ans_language.ans_approval || 'ans_not_approval'}      
              </Button>
          </Popconfirm>
        </FormItem>
      </Form>
    );
  }
}

export default FormPheduyet;