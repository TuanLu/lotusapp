import React from 'react'
import { Form, Row, Col, Input, Button, 
  Icon, message, Select, DatePicker
} from 'antd';
const {RangePicker} = DatePicker;
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
const FormItem = Form.Item;
const Option = Select.Option;
import {connect} from 'react-redux'

class AdvancedSearchForm extends React.Component {
  state = {
    loading: false
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      let filters = {...values};
      if(filters['workday'] && filters['workday'].length) {
        let rangeValue = filters['workday'];
        filters['workday'] = [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')];
      }
      //console.log('Received values of form: ', filters);
      this.search(filters);
    });
  }
  fetchJob() {
    fetch(ISD_BASE_URL + 'qljobs/fetchJob', {
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
            jobs: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    });
  }
  fetchNv() {
    fetch(ISD_BASE_URL + 'qlns/fetchNs', {
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
            nhanviens: json.data
          }));
        }
      }
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu dữ liệu kho!', 3);
      console.log(error);
    }); 
  }
  search(searchData) {
    this.setState({
      loading: true
    });
    this.props.loading(true);
    fetch(ISD_BASE_URL + 'qlsl/search', {
      method: 'POST',
      headers: getTokenHeader(),
      body: JSON.stringify(searchData)
    })
    .then((response) => {
      return response.json()
    }).then((json) => {
      if(json.status == 'error') {
        message.error(json.message, 3);
      } else {
        //Truyền dữ liệu lại bảng sản lượng sau khi tìm kiếm xong
        this.props.onResult(json.data);
      }
      this.setState({
        loading: false,
      });
      this.props.loading(false);
    }).catch((ex) => {
      console.log('parsing failed', ex)
      message.error('Có lỗi xảy ra trong quá trình tìm kiếm!');
      this.setState({
        loading: false,
      });
      this.props.loading(false);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
    this.search();
  }

  // To generate mock Form.Item
  getFields() {
    let {mainState} = this.props;
    let jobs = mainState.jobs || [];
    let nhanviens = mainState.nhanviens || [];
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Col span={8}>
          <FormItem label={`Lọc theo ngày`}>
            {getFieldDecorator(`workday`, {
              rules: [{
                required: false,
              }],
            })(
              <RangePicker 
                placeholder={['Từ Ngày', 'Đến Ngày']}
                format="DD/MM/YYYY" />
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo nhân viên`}>
            {getFieldDecorator(`ma_ns`, {
              rules: [{
                required: false,
              }],
            })(
              <Select 
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.join('').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                mode="multiple"
                placeholder="Nhập mã nhân viên">
                {nhanviens.map((nv) =><Option value={nv.ma_ns} key={nv.ma_ns}>{nv.ma_ns} {"-"} {nv.name}</Option>)}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem label={`Lọc theo mã công việc`}>
            {getFieldDecorator(`ma_cv`, {
              rules: [{
                required: false,
              }],
            })(
              <Select 
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>option.props.children.join('').toLowerCase().indexOf(input.toLowerCase()) >= 0}
                mode="multiple"
                placeholder="Nhập mã công việc">
                {jobs.map((job) =><Option value={job.ma_cv} key={job.ma_cv}>{job.ma_cv} - {job.diengiai}</Option>)}
              </Select>
            )}
          </FormItem>
        </Col>
      </React.Fragment>
    );
  }
  componentDidMount() {
    let {mainState} = this.props;
    let nhanviens = mainState.nhanviens || [];
    let jobs = mainState.jobs || [];
    if(!nhanviens.length) {
      this.fetchNv();
    }
    if(!jobs.length) {
      this.fetchJob();
    }
  }

  render() {
    return (
      <Form
        className="isd-advanced-search-form"
        onSubmit={this.handleSearch}
      >
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center', marginTop: 10 }}>
            <Button loading={this.state.loading} type="primary" htmlType="submit">Tìm kiếm</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
export default connect((state) => {
  return {
    mainState: state.main.present
  }
})(WrappedAdvancedSearchForm)