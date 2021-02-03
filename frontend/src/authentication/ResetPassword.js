import React from 'react'
import '../styles/Login.css'
import Common from '../Common';
import { Link } from 'react-router-dom'
import Modal from 'react-awesome-modal';
import $ from 'jquery';
import { strings } from '../Localization';
import { AuthLogo } from '../components/AuthLogo';

export class ResetPassword extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      new_password: '',
      confirm_password: '',
      reset_password_code: props.match.params.reset_password_code
    }

    console.log(this.state);
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

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }

  onSubmit(event) {
    event.preventDefault();

    if(this.state.new_password !== this.state.confirm_password) {
      Common.notify('warning', strings.PasswordDoesNotMatch);
      return;
    }

    let self = this;
    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/resetPassword',
      method: 'POST',
      data: {
        token: Common.getToken(),
        new_password: self.state.new_password,
        reset_password_code: self.state.reset_password_code
      },
      success: function (data) {
        $(".loading").hide();

        console.log(data);
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
                  <div className="card-title">{strings.ResetYourPassword}</div>
                  <div className="form-group">
                    <label className="form-label">{strings.NewPassword}</label>
                    <input type="password" className="form-control" placeholder={strings.EnterNewPassword} required autoComplete="off"
                      name="new_password" value={this.state.new_password} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{strings.ConfirmPassword}</label>
                    <input type="password" className="form-control" placeholder={strings.EnterConfirmPassword} required
                      name="confirm_password" value={this.state.confirm_password} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary btn-block">{strings.ResetPassword}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="400" height="270" effect="fadeInUp" onClickAway={this.closeModal.bind(this)}>
          <div className="text-center" style={{ padding: 40 }}>
            <h1>{strings.Succeed}!</h1>
            <p style={{ marginTop: 40 }}>{strings.YourPasswordHasBeenReset}</p>
            <div style={{ marginTop: 50 }}>
              <Link to="#" onClick={() => this.closeModal()} className="btn btn-outline-primary" style={{ width: 100 }}>{strings.Ok}</Link>
            </div>
          </div>
        </Modal>
      </div>
    )
  };
}