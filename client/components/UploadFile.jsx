import React from 'react'
import { Upload, Button, Icon,message } from 'antd';
import {getUploadTokenHeader} from 'ISD_API'

class FormUpload extends React.Component {
  state = {
    loading: false,
    fileList: this.props.fileList,
  }
  handleChange = (info) => {
    if (info.file.status !== 'uploading') {
      //console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      //message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      //message.error(`${info.file.name} file upload failed.`);
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      fileList: nextProps.fileList
    }
  }

  render() {
    const props = {
      action: ISD_BASE_URL + 'uploadFile',
      onChange: this.handleChange,
      multiple: false,
      headers: getUploadTokenHeader(),
      name: 'filename',
      beforeUpload: (file, fileList) => {
        this.setState({loading: true});
      },
      onSuccess: (response) => {
        //console.log('onSuccess', response);
        let fileUrl = ISD_BASE_URL + 'upload/' + response.data.filename;
        this.setState({
          loading: false,
          fileList: this.state.fileList
        });
        message.success(response.message);
        this.props.onDone(response.data.filename);
      },
      onRemove: (file) => {
        this.props.onRemove(file.name);
      },
      onError: (err) => {
        message.error(error.message || 'Không upload được file!');
        this.setState({loading: false});
      },
    };
    return (
      <Upload {...props} fileList={this.state.fileList}>
        <Button loading={this.state.loading}>
          <Icon type="upload" /> Tải lên
        </Button>
      </Upload>
    );
  }
}

export default FormUpload;