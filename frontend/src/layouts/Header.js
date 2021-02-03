import React from 'react'
import '../styles/Header.css'
import { Link } from 'react-router-dom'
import Common from '../Common';
import { strings } from '../Localization';
import $ from 'jquery'


const DEFAULT_AVATAR = '/assets/images/avatar.png';

export class Header extends React.Component {

  static self;
  
  constructor(props) {
    super(props);

    let settings = Common.getSettings();
    this.state = {
      loggedIn: Common.loggedIn(),
      user: Common.getUser(),
      pathname: '/',
      logo: Common.isNone(settings) || settings.logo === undefined ? '/assets/images/tremtec-logo-small.png' : settings.logo
    }

    Header.self = this;
  }

  logout() {
    Common.logout();
  }

  componentDidMount() {
    this.setState({
      pathname: window.location.pathname
    });

    if(this.state.user !== null) {
      if (Common.isNone(this.state.user.avatar)) {
        let user = this.state.user;
        user.avatar = DEFAULT_AVATAR;
        this.setState({ user: user });
      }
    }
  }

  setLanguage(language) {
    localStorage.setItem('_language', language);
    window.location.reload();
  }

  handleBackupDatabase() {
    let url = Common.BACKEND + '/api/backup';
    url += '?token=' + Common.getToken();
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $(".loading").hide();

        Common.notify('success', strings.TheDatabaseHasBeenCopied);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }
  
  render() {
    const pathname = this.state.pathname;
    let pathData = {
      schedule: {
        pathname: "/schedule",
        title: strings.Schedule,
        className: "nav-link",
        iconName: "fe fe-clock"
      },
      media: {
        pathname: "/media",
        title: strings.Media,
        className: "nav-link",
        iconName: "fa fa-image"
      },
      playlists: {
        pathname: "/playlists",
        title: strings.Playlist,
        className: "nav-link",
        iconName: "fa fa-play"
      },
      web_radio: {
        pathname: "/web_radio",
        title: strings.Radio,
        className: "nav-link",
        iconName: "fa fa-headphones"
      },
      screen: {
        pathname: "/screen",
        title: strings.Screen,
        className: "nav-link",
        iconName: "fa fa-desktop"
      },
      overlays: {
        pathname: "/overlays",
        title: strings.Overlay,
        className: "nav-link",
        iconName: "fa fa-object-ungroup"
      },
      admin: {
        pathname: "/admin",
        title: strings.Admin,
        className: "nav-link",
        iconName: "fa fa-cogs",
      },
      admin_users: {
        pathname: "/admin/users",
        title: strings.Users,
        className: "dropdown-item"
      },
      admin_settings: {
        pathname: "/admin/settings",
        title: strings.Settings,
        className: "dropdown-item"
      },
    };
    for (let key in pathData) {
      let row = pathData[key];
      let active = false;
      if (pathname === '/') {
        active = row.pathname === '/';
      } else {
        active = pathname.indexOf(row.pathname) > -1 && row.pathname !== '/';
      }
      row.className += active ? " active" : "";
    }
    let language = Common.language();
    let englishActive = language === 'English' ? ' active' : '';
    let germanActive = language === 'German' ? ' active' : '';
    let languageCode = language === 'English' ? 'ENG' : 'GER';
    let headerClassName = "header";
    headerClassName += Common.loggedIn() ? " pt-4" : " py-4";

    return (
      <div>
        <div className={headerClassName}>
          <div className="container">
            <div className="d-flex">
              <Link className="header-brand" to="/">
                <img src={this.state.logo} className="header-brand-img" alt="tabler logo" />
              </Link>
              <div className="d-flex order-lg-2 ml-auto">
                <div className="dropdown">
                  <Link to="#" className="btn btn-sm btn-secondary mr-3" data-toggle="dropdown" style={{marginTop: 6}}>
                    {languageCode} <i className="fe fe-chevron-down" style={{ marginRight: -3, verticalAlign: 'text-bottom' }}></i>
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                    <Link className={"dropdown-item" + germanActive} to="#" onClick={this.setLanguage.bind(this, 'German')}>
                      German
                    </Link>
                    <Link className={"dropdown-item" + englishActive} to="#" onClick={this.setLanguage.bind(this, 'English')}>
                      English
                    </Link>
                  </div>
                </div>
                {this.state.loggedIn ?
                  this.state.user !== null ?
                    <div>
                      <div className="dropdown">
                        <Link to="#" className="nav-link pr-0 leading-none" data-toggle="dropdown">
                          <span className="avatar" style={{ backgroundImage: 'url(' + this.state.user.avatar + ')' }} />
                          <span className="ml-2 d-none d-lg-block">
                            <span className="text-default">{this.state.user.name}</span>
                            <small className="text-muted d-block mt-1">{this.state.user.role.name}</small>
                          </span>
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                          <Link className="dropdown-item" to="/profile">
                            <i className="dropdown-icon fe fe-user" /> {strings.Profile}
                        </Link>
                          <Link className="dropdown-item" to="#" onClick={this.logout.bind(this)}>
                            <i className="dropdown-icon fe fe-log-out" /> {strings.SignOut}
                        </Link>
                        </div>
                      </div>
                    </div>
                    : null
                  :
                  <div className="nav-item d-none d-md-flex auth-button">
                    <Link to="/auth/login" className="btn btn-sm btn-outline-primary" style={{marginRight: -10}}>{strings.LogIn}</Link>
                  </div>
                }
                {!this.state.loggedIn ?
                  <div className="nav-item d-none d-md-flex auth-button">
                    <Link to="/auth/register" className="btn btn-sm btn-success">{strings.SignUp}</Link>
                  </div>
                  : null}
              </div>
              <Link to="#" className="header-toggler d-lg-none ml-3 ml-lg-0" data-toggle="collapse" data-target="#headerMenuCollapse">
                <span className="header-toggler-icon" />
              </Link>
            </div>
          </div>
        </div>
        <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 ml-auto">
                {/* Right nav-item */}
              </div>
              <div className="col-lg order-lg-first">
                <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                  <li className="nav-item">
                    <Link to={pathData.schedule.pathname} className={pathData.schedule.className}>
                      <i className={pathData.schedule.iconName} /> {pathData.schedule.title}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={pathData.media.pathname} className={pathData.media.className}>
                      <i className={pathData.media.iconName} /> {pathData.media.title}
                    </Link>
                  </li>
                  <li className="nav-item" style={this.state.loggedIn ? null : {display: 'none'}}>
                    <Link to={pathData.playlists.pathname} className={pathData.playlists.className}>
                      <i className={pathData.playlists.iconName} /> {pathData.playlists.title}
                    </Link>
                  </li>
                  <li className="nav-item" style={this.state.loggedIn ? null : { display: 'none' }}>
                    <Link to={pathData.overlays.pathname} className={pathData.overlays.className}>
                      <i className={pathData.overlays.iconName} />&nbsp;{pathData.overlays.title}
                    </Link>
                  </li>
                  <li className="nav-item" style={this.state.loggedIn ? null : { display: 'none' }}>
                    <Link to={pathData.web_radio.pathname} className={pathData.web_radio.className}>
                      <i className={pathData.web_radio.iconName} /> {pathData.web_radio.title}
                    </Link>
                  </li>
                  <li className="nav-item" style={this.state.loggedIn ? null : { display: 'none' }}>
                    <Link to={pathData.screen.pathname} className={pathData.screen.className}>
                      <i className={pathData.screen.iconName} /> {pathData.screen.title}
                    </Link>
                  </li>
                  {this.state.user !== null ?
                    this.state.user.role.slug === 'admin' ?
                      <li className="nav-item">
                        <Link to="#" className={pathData.admin.className} data-toggle="dropdown">
                          <i className={pathData.admin.iconName} /> {pathData.admin.title}
                        </Link>
                        <div className="dropdown-menu dropdown-menu-arrow">
                          <Link to={pathData.admin_users.pathname} className={pathData.admin_users.className}>
                            {pathData.admin_users.title}
                          </Link>
                          <Link to={pathData.admin_settings.pathname} className={pathData.admin_settings.className}>
                            {pathData.admin_settings.title}
                          </Link>
                        </div>
                      </li>
                    : null
                  : null}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {this.state.user !== null ?
          this.state.user.role.slug === 'admin' ?
            <div className="fixed-action-btn">
              <button className="btn btn-success db-save-button" title="Save database" onClick={this.handleBackupDatabase.bind(this)}>
                <i className="fe fe-save"></i>
              </button>
            </div>
            : null
          : null}
      </div>
    );
  }
}