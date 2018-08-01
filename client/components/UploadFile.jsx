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
        this.setState({
          loading: false,
          fileList: [
            {
              uid: -1,
              name: response.data.filename,
              status: 'done',
              url: ISD_BASE_URL + 'upload/' + response.data.filename,
            }
          ]
        });
        message.success(response.message);
      },
      onError: (err) => {
        message.error(error.message || 'Không upload được file!');
        this.setState({loading: false});
      },
    };
    return (
      <Upload {...props} fileList={this.state.fileList}>
        <Button loading={this.state.loading}>
          <Icon type="upload" /> Upload
        </Button>
      </Upload>
    );
  }
}

export default FormUpload;