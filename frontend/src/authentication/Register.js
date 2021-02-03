import React from 'react'
import '../styles/Login.css'
import Common from '../Common';
import {Link} from 'react-router-dom'
import Modal from 'react-awesome-modal';
import $ from 'jquery';
import { strings } from '../Localization';
import { AuthLogo } from '../components/AuthLogo';


export class Register extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      name: '',
      email: '',
      password: '',
      confirm_password: '',
    }
  }

  componentDidMount() {
    $('.auth-container').css('height', $(window).height());
  }

  onSubmit(event) {
    event.preventDefault();

    if(this.state.password !== this.state.confirm_password) {
      Common.notify('warning', strings.PasswordDoesNotMatch);
      return;
    }

    let body = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      front_url: Common.FRONTEND
    }
    console.log('login', body);

    let self = this;
    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/register',
      method: 'POST',
      data: body,
      success: function (data) {
        $(".loading").hide();
        
        self.openModal();
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

  openModal() {
    this.setState({
      visible: true
    });
  }

  closeModal() {
    this.setState({
      visible: false
    });

    window.location.href = "/";
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
                  <div className="card-title">{strings.CreateNewAccount}</div>
                  <div className="form-group">
                    <label className="form-label">{strings.Name}</label>
                    <input type="text" className="form-control" placeholder={strings.Enter + ' ' + strings.name} required
                      name="name" value={this.state.name} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{strings.EmailAddress}</label>
                    <input type="email" className="form-control" placeholder={strings.Enter + ' ' + strings.email} required autoComplete="off"
                      name="email" value={this.state.email} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{strings.Password}</label>
                    <input type="password" className="form-control" placeholder={strings.Enter + ' ' + strings.password} required autoComplete="off"
                      name="password" value={this.state.password} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{strings.ConfirmPassword}</label>
                    <input type="password" className="form-control" placeholder={strings.EnterConfirmPassword} required
                      name="confirm_password" value={this.state.confirm_password} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary btn-block">{strings.CreateNewAccount}</button>
                  </div>
                </div>
              </form>
              <div className="text-center text-muted">
                {strings.AlreadyHaveAccount} <Link to="/auth/login">{strings.SignIn}</Link>
              </div>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="400" height="300" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <div className="text-center" style={{padding: 40}}>
            <h1>{strings.SignUpSucceed}</h1>
            <p style={{ marginTop: 40 }}>{strings.YouHaveSignedUpSuccessfully}</p>
            <p>{strings.PleaseFindAnEmail}</p>
            <div style={{marginTop: 50}}>
              <Link to="#" onClick={() => this.closeModal()} className="btn btn-outline-primary" style={{width: 100}}>{strings.Ok}</Link>
            </div>
          </div>
        </Modal>
      </div>
    )
  };
}