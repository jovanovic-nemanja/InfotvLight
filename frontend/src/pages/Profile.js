import React from 'react';
import '../styles/Profile.css'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common';
import $ from 'jquery'
import { strings } from '../Localization';


export class Profile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: Common.getUser(),
      password: '',
      new_password: '',
      confirm_password: '',
      changingAvatar: false
    }

    console.log('user', this.state.user);
  }

  componentDidMount() {
    let self = this;

    $('#avatarInput').change(function (event) {
      var FR = new FileReader();

      FR.addEventListener("load", function (e) {
        let type = e.target['result'].split("/")[0];
        if (type !== 'data:image') {
          Common.notify('error', strings.PleaseSelectAnImageToUpload);
          $('#avatarInput').val('');
        } else {
          let user = self.state.user;
          user.avatar = e.target['result'];
          self.setState({ user: user });
        }
      });

      FR.readAsDataURL(event.target.files[0]);
    });
  }

  handleProfileChange(event) {
    let name = event.target.name;
    let user = this.state.user;
    user[name] = event.target.value;
    this.setState({ user: user });
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }
  
  onSubmit(event) {
    event.preventDefault();

    let body = {
      name: this.state.user.name,
      bio: this.state.user.bio,
      token: Common.getToken()
    }
    console.log('update profile', body);

    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/updateProfile',
      method: 'POST',
      data: body,
      success: function (data) {
        $(".loading").hide();

        console.log(data);
        window.location.href = '/';
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onResetPassword(event) {
    event.preventDefault();

    if(this.state.new_password !== this.state.confirm_password) {
      Common.notify('warning', strings.PasswordDoesNotMatch);
      return;
    }

    let body = {
      password: this.state.password,
      new_password: this.state.new_password,
      token: Common.getToken()
    }
    console.log('update profile', body);

    $('.loading').show();

    $.ajax({
      url: Common.BACKEND + '/api/updatePassword',
      method: 'POST',
      data: body,
      success: function (data) {
        $(".loading").hide();

        console.log(data);
        Common.logout();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleChangingAvatar() {
    this.setState({
      changingAvatar: true
    });
  }

  handleCancelAvatar() {
    let user = this.state.user;
    user.avatar = Common.getUser().avatar;

    this.setState({
      changingAvatar: false,
      user: user
    });

    $('#avatarInput').val('');
  }

  uploadAvatar() {
    let body = { 
      avatar: this.state.user.avatar,
      token: Common.getToken()
    };
    
    if ($('#avatarInput').val() === '') {
      Common.notify('error', strings.PleaseSelectAnImageToUpload);
      return;
    }

    $('.loading').show();
    let url = Common.BACKEND + '/api/uploadAvatar';

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $(".loading").hide();

        Common.notify('success', strings.AvatarHasBeenUpdated);
        window.location.href = '/';
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  render() {

    let showFileInput = this.state.changingAvatar ? { display: 'block' } : { display: 'none' };
    let showChangeButton = !this.state.changingAvatar ? { display: 'block' } : { display: 'none' };
    const user = this.state.user;

    return (
      <div className="page-main">
        <Header />
        {user !== null ?
          <div className="my-3 my-md-5 main-content">
            <div className="container">
              <div className="row">
                <div className="col-lg-4">
                  <div className="card card-profile">
                    <div className="card-body text-center">
                      <img className="profile-avatar" src={user.avatar} alt="" />
                      <div className="mt-3 mb-5">
                        <div style={showFileInput}>
                          <input id="avatarInput" type="file" style={{ width: 200 }} />
                          <div className="mt-3">
                            <button className="btn btn-sm btn-outline-primary" onClick={this.uploadAvatar.bind(this)}>{strings.Upload}</button>
                            <button className="btn btn-sm btn-secondary ml-2" onClick={this.handleCancelAvatar.bind(this)}>{strings.Cancel}</button>
                          </div>
                        </div>
                        <div className="text-center">
                          <button className="btn btn-outline-primary btn-sm force-center" style={showChangeButton} onClick={this.handleChangingAvatar.bind(this)}>
                            <i className="fa fa-pencil"></i> {strings.ChangeAvatar}
                          </button>
                        </div>
                      </div>
                      <h3 className="mb-3">{user.name}</h3>
                      <p className="mb-4">
                        {user.bio}
                      </p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">{strings.ResetPassword}</h3>
                    </div>
                    <div className="card-body">
                      <form onSubmit={this.onResetPassword.bind(this)}>
                        <div className="form-group">
                          <label className="form-label">{strings.Password}</label>
                          <input className="form-control" type="password" placeholder={strings.EnterYourPassword} required
                            name="password" value={this.state.password} onChange={this.handleChange.bind(this)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{strings.NewPassword}</label>
                          <input className="form-control" type="password" placeholder={strings.EnterNewPassword} required
                            name="new_password" value={this.state.new_password} onChange={this.handleChange.bind(this)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{strings.ConfirmPassword}</label>
                          <input className="form-control" type="password" placeholder={strings.EnterConfirmPassword} required
                            name="confirm_password" value={this.state.confirm_password} onChange={this.handleChange.bind(this)} />
                        </div>
                        <div className="form-footer text-center">
                          <button type="submit" className="btn btn-outline-primary" style={{ width: '50%' }}>{strings.Reset}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">{strings.MyProfile}</h3>
                    </div>
                    <div className="card-body">
                      <form onSubmit={this.onSubmit.bind(this)}>
                        <div className="form-group">
                          <label className="form-label">{strings.Name}</label>
                          <input className="form-control" placeholder={strings.EnterYourName} required
                            name="name" value={user.name} onChange={this.handleProfileChange.bind(this)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{strings.Bio}</label>
                          <textarea className="form-control" rows={5} placeholder={strings.EnterYourBio} required
                            name="bio" value={user.bio} onChange={this.handleProfileChange.bind(this)} />
                        </div>
                        <div className="form-footer">
                          <button type="submit" className="btn btn-primary" style={{ width: 150 }}>{strings.Save}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        : null}
        <Footer />
      </div>
    );
  }

}