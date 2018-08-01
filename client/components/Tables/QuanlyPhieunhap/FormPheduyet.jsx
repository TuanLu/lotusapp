import React from 'react'
import { Form } from 'antd';
import UploadFile from './../../UploadFile';

class FormPheduyet extends React.Component {
  render() {
    let {phieunhap} = this.props.mainState;
    let pheduyet = phieunhap.pheduyet || {};
    return (
      <Form>
        <FormItem
          label="Nội dung phê duyệt"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 12 }}
        >
          <UploadFile
            fileList={[]}
            mainState={this.props.mainState}
            dispatch={this.props.dispatch}/>
        </FormItem>
      </Form>
    );
  }
}

export default FormPheduyet;