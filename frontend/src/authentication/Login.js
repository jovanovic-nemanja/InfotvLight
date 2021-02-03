import React from 'react'
import '../styles/Login.css'
import Common from '../Common';
import {Link} from 'react-router-dom'
import $ from 'jquery';
import { strings } from '../Localization'
import { AuthLogo } from '../components/AuthLogo';


export class Login extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    }
  }

  componentDidMount() {
    $('.auth-container').css('height', $(window).height());
  }

  onSubmit(event) {
    event.preventDefault();

    let body = {
      email: this.state.email,
      password: this.state.password
    }
    console.log('login', body);

    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/login',
      method: 'POST',
      data: body,
      success: function (data) {
        $(".loading").hide();

        Common.setToken(data.token);
        window.location.href = '/';
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

  render() {
    return (
      <div className="page-single auth-container">
        <div className="container">
          <div className="row">
            <div className="col col-login mx-auto">
              <AuthLogo />
              <form className="card" action="#" onSubmit={this.onSubmit.bind(this)}>
                <div className="card-body p-6">
                  <div className="card-title">{strings.LoginToYourAccount}</div>
                  <div className="form-group">
                    <label className="form-label">{strings.EmailAddress}</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder={strings.Enter + ' ' + strings.email}
                      name="email" value={this.state.email} onChange={this.handleChange.bind(this)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <label className="form-label">{strings.Password}</label>
                    </label>
                    <input type="password" className="form-control" id="exampleInputPassword1" placeholder={strings.Enter + ' ' + strings.Password}
                      name="password" value={this.state.password} onChange={this.handleChange.bind(this)} required />
                    <Link to="/auth/forgot_password" className="float-right small mt-2 mb-5">{strings.IForgotPassword}</Link>
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary btn-block">{strings.SignIn}</button>
                  </div>
                </div>
              </form>
              <div className="text-center text-muted">
                {strings.DontHaveAccountYet} <Link to="/auth/register">{strings.SignUp}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  };
}