import React from 'react'
import { Link } from 'react-router-dom'
import Common from '../Common'


export class AuthLogo extends React.Component {

  constructor(props) {
    super(props);

    let settings = Common.getSettings();
    this.state = {
      auth_logo: Common.isNone(settings) || settings.auth_logo === undefined ? '/assets/images/tremtec-logo-white.png' : settings.auth_logo
    }
  }
  

  render() {
    return (
      <div className="text-center mb-6">
        <Link to="/">
          <img src={this.state.auth_logo} className="auth-logo" alt="" />
        </Link>
      </div>
    );
  }
}