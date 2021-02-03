import React from 'react'
import '../styles/Login.css'
import Common from '../Common';
import { Link } from 'react-router-dom'
import Modal from 'react-awesome-modal';
import $ from 'jquery';
import { strings } from '../Localization';
import { AuthLogo } from '../components/AuthLogo';

export class Verify extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      confirm_password: props.match.params.confirmation_code,
      message: ''
    }

    console.log(this.state);
  }

  componentWillMount() {
  }

  openModal() {
    this.setState({
      visible: true
    });
  }

  closeModal() {
    this.setState({
      visible: false
    });

    this.props.history.push('/auth/login');
  }

  componentDidMount() {
    $('.auth-container').css('height', $(window).height());
  }

  onSubmit(event) {
    event.preventDefault();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/verifyAccount',
      method: 'POST',
      data: {
        token: Common.getToken(),
        confirmation_code: self.state.confirm_password
      },
      success: function (data) {
        $(".loading").hide();

        self.setState({
          message: data.message 
        });
        self.openModal();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  render() {
    return (
      <div className="page-single auth-container">
        <div className="container">
          <div className="row">
            <div className="col col-login mx-auto">
              <AuthLogo />
              <form className="card" action="#" onSubmit={this.onSubmit.bind(this)}>
                <div className="card-body p-6">
                  <h4>{strings.ConfirmYourAccount}</h4>
                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary btn-block">{strings.VerifyAccount}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="400" height="270" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <div className="text-center" style={{ padding: 40 }}>
            <h1>{strings.VerifySucceed}</h1>
            <p style={{ marginTop: 40 }}>{this.state.message}</p>
            <div style={{ marginTop: 50 }}>
              <Link to="#" onClick={() => this.closeModal()} className="btn btn-outline-primary" style={{ width: 100 }}>{strings.Ok}</Link>
            </div>
          </div>
        </Modal>
      </div>
    )
  };
}