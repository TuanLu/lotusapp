import React from 'react'
import { Form, Button, Select, message } from 'antd';
import {updateStateData} from 'actions'
import {getTokenHeader} from 'ISD_API'
const FormItem = Form.Item;
const Option = Select.Option;

class TimeRelatedForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expandedRowRender: true,
      ma_kho: this.props.record.ma_kho,
      vi_tri_kho: this.props.record.vi_tri_kho
    };
    this.changeInventory = this.changeInventory.bind(this);
  }
  changeInventory(value) {
    this.setState({
      ma_kho: value,
      vi_tri_kho: ''//Reset position
    });
    this.props.form.resetFields(['vi_tri_kho']);
  }
  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, row) => {
      if (err) {
        return;
      }
      //console.log('Received values of form: ', row, this.props.record);
      let positionData = {
        id: this.props.record.id,
        ma_phieu: this.props.record.ma_phieu,
        ma_kho: this.state.ma_kho,
        vi_tri_kho: row.vi_tri_kho.join(','),
        //product_id: this.props.record.product_id
      };
      //console.log(positionData);
      this.changeProductPosition(positionData);
    });
  }
  changeProductPosition = (data) => {
    this.setState({ loading: true });
    fetch(ISD_BASE_URL + 'phieunhap/changePosition', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(data)
    })
    .then((response) => {
      return response.json()
    }).then((json) => {
      if(json.status == 'error') {
        message.error(json.message, 3);
        if(json.show_login) {
          this.props.dispatch(updateStateData({showLogin: true}));
        }
      } else {
        //this.fetchSelectedProduct();
        message.success(json.message);
      }
      this.setState({
        loading: false,
      });
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa!');
    });
  }
  fetchKhoData() {
    fetch(ISD_BASE_URL + 'qlkho/fetchKho', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            kho: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  fetchViTriKhoData() {
    fetch(ISD_BASE_URL + 'qlvtkho/fetchVtkho', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.props.dispatch(updateStateData({
            vi_tri_kho: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu vị trí kho!', 3);
      console.log(error);
    }); 
  }
  componentDidMount() {
    let {mainState} = this.props;
    let kho = mainState.kho || [];
    let viTriKho = mainState.vi_tri_kho || [];
    if(!kho.length) {
      this.fetchKhoData();
    }
    if(!viTriKho.length) {
      this.fetchViTriKhoData();
    }
  }
  khoOptions() {
    let {mainState} = this.props;
    let kho = mainState.kho || [];
    if(kho.length) {
      return kho.map((kho) => <Option key={kho.id} value={kho.ma_kho}>{kho.ma_kho} {"-"} {kho.name}</Option>);
    }
  }
  viTriKhoOptions() {
    let {mainState} = this.props;
    let viTriKho = mainState.vi_tri_kho || [];
    if(viTriKho.length) {
      //Filter with selected inventory
      //console.log(viTriKho, this.state);
      viTriKho = viTriKho.filter((vitri) => vitri.ma_kho == this.state.ma_kho);
      return viTriKho.map((vitri) => <Option key={vitri.id} value={vitri.id}>{vitri.name}</Option>);
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let {ma_kho, vi_tri_kho} = this.state;
    let selectedPosition = [];
    if(vi_tri_kho != "") {
      selectedPosition = vi_tri_kho.split(',');
    }
    const config = {
      rules: [{ required: true, message: 'Hãy chọn vị trí kho' }],
    };
    return (
      <Form onSubmit={this.handleSubmit} className="form-cap-nhat-vi-tri">
        <FormItem
          label="Tại kho"
        >
          {getFieldDecorator('ma_kho', {
            required: true, 
            initialValue: ma_kho,
          })(
            <Select
              onChange={this.changeInventory}
              placeholder="Kho hàng">
              {this.khoOptions()}
            </Select>
          )}
        </FormItem>
        <FormItem
          label="Chọn vị trí trong kho"
        >
          {getFieldDecorator('vi_tri_kho', {...config, 
            initialValue: selectedPosition})(
            <Select 
              mode="multiple" 
              placeholder="Chọn vị trí kho">
             {this.viTriKhoOptions()}
            </Select>
          )}
        </FormItem>
        <FormItem
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: 16, offset: 8 },
          }}
        >
          <Button loading={this.state.loading} type="primary" htmlType="submit">Cập nhật vị trí</Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedTimeRelatedForm = Form.create()(TimeRelatedForm);

export default WrappedTimeRelatedForm