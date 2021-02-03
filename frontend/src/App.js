import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { strings } from './Localization';
import Notifications from 'react-notify-toast';
import Modal from 'react-awesome-modal';
import Common from './Common';
import $ from 'jquery'
import { Login } from './authentication/Login';
import { Register } from './authentication/Register';
import { Verify } from './authentication/Verify';
import { ForgotPassword } from './authentication/ForgotPassword';
import { ResetPassword } from './authentication/ResetPassword';
import { Users } from './admin/Users';
import { Settings } from './admin/Settings';
import { Schedule } from './pages/Schedule';
import { Media } from './pages/Media';
import { Profile } from './pages/Profile';
import { Playlists } from './pages/Playlists';
import { Playlist } from './pages/Playlist';
import { ImageForm } from './pages/ImageForm';
import { WebsiteForm } from './pages/WebsiteForm';
import { VideoForm } from './pages/VideoForm';
import { GalleryForm } from './pages/GalleryForm';
import { Overlays } from './pages/Overlays';
import { Overlay } from './pages/Overlay';
import { WebRadio } from './pages/WebRadio';
import { ScreenContent } from './pages/ScreenContent';


strings.setLanguage(Common.language());

class App extends Component {
  
  static self;

  constructor(props) {
    super(props);
    
    this.state = {
      confirmDescription: 'Are you sure to delete this?',
      confirmVisible: false,
      confirmCallback: null
    }
    App.self = this;
  }
  
  openConfirmModal(description, callback) {
    this.setState({
      confirmVisible: true,
      confirmDescription: description,
      confirmCallback: callback
    });
  }

  closeConfirmModal() {
    this.setState({
      confirmVisible: false
    });
  }

  static confirm(description, callback) {
    App.self.openConfirmModal(description, callback);
  }

  handleConfirm() {
    this.closeConfirmModal();
    this.state.confirmCallback();
  }

  componentDidMount() {
    Common.refreshUI();

    let self = this;
    $(window).resize(function () {
      self.onResize();
    });
  }

  onResize() {
    $('.auth-container').css('height', $(window).height());
  }

  render() {
    var isLogin = false;
    var token = Common.getToken();
    if (token && token !== 'null') {
      isLogin = true;
    }
    return (
      <Router>
        <div>
          <Notifications />
          <div className="page">
            {/* Auth pages */}
            <Route exact path="/auth/login" render={() => <Login />} />
            <Route exact path="/auth/register" render={() => <Register />} />
            <Route exact path="/auth/verify/:confirmation_code" render={(props) => <Verify {...props} />} />
            <Route exact path="/auth/forgot_password" render={(props) => <ForgotPassword {...props} />} />
            <Route exact path="/auth/reset_password/:reset_password_code" render={(props) => <ResetPassword {...props} />} />
            {/* Main pages */}
            <Route exact path="/" render={() => { return isLogin ? <Schedule />: <Login/> }} />
            <Route exact path="/schedule" render={() => <Schedule />} />
            <Route exact path="/media" render={() => <Media />} />
            <Route exact path="/media/image_form/:id" render={(props) => <ImageForm {...props} />} />
            <Route exact path="/media/website_form/:id" render={(props) => <WebsiteForm {...props} />} />
            <Route exact path="/media/video_form/:id" render={(props) => <VideoForm {...props} />} />
            <Route exact path="/media/gallery_form/:id" render={(props) => <GalleryForm {...props} />} />
            <Route exact path="/profile" render={() => <Profile />} />
            <Route exact path="/playlists" render={() => <Playlists />} />
            <Route exact path="/playlists/:id" render={(props) => <Playlist {...props} />} />
            <Route exact path="/overlays" render={() => <Overlays />} />
            <Route exact path="/overlays/:id" render={(props) => <Overlay {...props} />} />
            <Route exact path="/web_radio" render={() => <WebRadio />} />
            <Route exact path="/screen" render={() => <ScreenContent />} />
            {/* Admin pages */}
            <Route exact path="/admin/users" render={() => <Users />} />
            <Route exact path="/admin/settings" render={() => <Settings />} />
          </div>
          <Modal visible={this.state.confirmVisible} width="360" height="145" effect="fadeInDown" onClickAway={() => this.closeConfirmModal()}>
            <div className="text-center" style={{ padding: '30px 10px' }}>
              <p style={{color: 'black'}}>{this.state.confirmDescription}</p>
              <div style={{ marginTop: 30 }}>
                <button onClick={() => this.handleConfirm()} className="btn btn-primary" style={{ width: 70, padding: '4px 0' }}>
                  {strings.Yes}
                </button>
                <button onClick={() => this.closeConfirmModal()} className="btn btn-secondary ml-2" style={{ width: 70, padding: '4px 0' }}>
                  {strings.No}
                </button>
              </div>
            </div>
          </Modal>
          <div className="loading" style={{ display: 'none' }}>Loading...</div>
        </div>
      </Router>
    );
  }
}

export default App;
