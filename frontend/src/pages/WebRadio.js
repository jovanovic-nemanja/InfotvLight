import React from 'react';
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import { strings } from '../Localization';


export class WebRadio extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      url: ''
    }
  }

  componentDidMount() {
    this.getRadio();
  }

  getRadio() {
    let url = Common.BACKEND + '/api/web_radio/MainRadio';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        self.setState({
          url: data.url
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }

  onSubmit(event) {
    event.preventDefault();

    let url = Common.BACKEND + '/api/web_radio/MainRadio';
    url += '?token=' + Common.getToken();
    let body = {
      url: this.state.url
    }

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'PUT',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.TheRadioURLHasBeenUpdated)
        self.getRadio();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  render() {

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.EditRadioURL}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form onSubmit={this.onSubmit.bind(this)}>
                  <div className="input-icon">
                    <span className="input-icon-addon">
                      <i className="fa fa-pencil"></i>
                    </span>
                    <input type="text" className="form-control w-10" placeholder={strings.TypeRadioUrl} required
                      name="url" value={this.state.url} onChange={this.handleChange.bind(this)} />
                  </div>
                  <p className="mt-3 mb-5">
                    {strings.StreamAddressInHttpDescription}
                  </p>
                  <button type="submit" className="btn btn-primary">
                    <i className="fe fe-save"></i> {strings.Save}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

}