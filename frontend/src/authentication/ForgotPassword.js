import React from 'react'
import '../styles/Login.css'
import Common from '../Common';
import { Link } from 'react-router-dom'
import Modal from 'react-awesome-modal';
import $ from 'jquery';
import { strings } from '../Localization';
import { AuthLogo } from '../components/AuthLogo';

export class ForgotPassword extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      email: ''
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

    this.props.history.push('/');
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

    let self = this;
    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/forgotPassword',
      method: 'POST',
      data: {
        token: Common.getToken(),
        email: self.state.email,
        front_url: Common.FRONTEND
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
                    <label className="form-label">{strings.EmailAddress}</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder={strings.Enter + ' ' + strings.email}
                      name="email" value={this.state.email} onChange={this.handleChange.bind(this)} required />
                  </div>
                  <div className="form-footer">
                    <button type="submit" className="btn btn-primary btn-block">{strings.ResetPassword}</button>
                  </div>
                </div>
              </form>
              <div className="text-center text-muted">
                {strings.DontHaveAccountYet} <Link to="/auth/register">{strings.SignUp}</Link>
              </div>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="400" height="270" effect="fadeInUp" onClickAway={this.closeModal.bind(this)}>
          <div className="text-center" style={{ padding: 40 }}>
            <h1>{strings.Succeed}!</h1>
            <p style={{ marginTop: 40 }}>{strings.PleaseCheckYourEmail}</p>
            <div style={{ marginTop: 50 }}>
              <Link to="#" onClick={() => this.closeModal()} className="btn btn-outline-primary" style={{ width: 100 }}>{strings.Ok}</Link>
            </div>
          </div>
        </Modal>
      </div>
    )
  };
}