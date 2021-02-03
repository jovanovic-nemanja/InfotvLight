import React from 'react'
import '../styles/Users.css'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import Pagination from "react-js-pagination";
import $ from 'jquery'
import { strings } from '../Localization';


export class Users extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      search: '',
      userSource: [],
      pageIndex: 1,
      totalCount: 0
    };
  }

  componentDidMount() {
    this.getUsers(1);
  }

  getUsers(pageIndex) {
    let url = Common.BACKEND + '/api/admin/users';
    url += '?page=' + pageIndex;
    url += '&search=' + this.state.search;
    url += '&token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log('users', data);
        self.setState({
          userSource: data.data,
          totalCount: data.total,
          pageIndex: pageIndex
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

  handleSearch(event) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearch = () => {
    console.log('search');
    let self = this;
    window.setTimeout(function () {
      self.getUsers(self.state.pageIndex);
    }, 10);
  }

  approveDismiss(id, flag) {
    console.log('approveDismiss', id, flag);

    let self = this;
    $('.loading').show();
    let url = Common.BACKEND + '/api/admin/approveDismissUser';
    let body = {
      user_id: id,
      approved: flag,
      token: Common.getToken()
    }

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        if(flag === 1) {
          Common.notify('success', strings.TheUserHasBeenApproved);
        } else {
          Common.notify('success', strings.TheUserHasBeenDismissed);
        }
        self.getUsers(self.state.pageIndex);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handlePageChange(pageNumber) {
    this.getUsers(pageNumber);
  }

  render() {
    let self = this;
    let users = this.state.userSource.map(function(item, i) {
      let index = (self.state.pageIndex - 1) * 10 + i + 1;

      return (
        <tr key={item.id} style={{verticalAlign: 'middle'}}>
          <td>
            <span className="text-muted">{index}</span>
          </td>
          <td>
            <img src={item.avatar} className="avatar" alt="" />
          </td>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{Common.humanDate(item.created_at)}</td>
          <td>
            {parseInt(item.approved) === 1 ?
              <span className="badge badge-success">{strings.approved}</span>
            :
              <span className="badge badge-default">{strings.dismissed}</span>
            }
          </td>
          <td>
            {parseInt(item.approved) === 0 ?
              <button className="btn btn-outline-primary btn-sm" onClick={self.approveDismiss.bind(self, item.id, 1)}>{strings.Approve}</button>
            :
              <button className="btn btn-outline-secondary btn-sm" onClick={self.approveDismiss.bind(self, item.id, 0)}>{strings.Dismiss}</button>
            }
          </td>
        </tr>
      )
    });

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.ManageUsers}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row mb-5">
                  <div className="col-md-6">
                    <div className="input-icon ml-2">
                      <span className="input-icon-addon">
                        <i className="fe fe-search"></i>
                      </span>
                      <input type="text" className="form-control w-10" placeholder={strings.Search + ' ' + strings.user}
                        name="search" value={this.state.search} onKeyUp={this.handleSearch.bind(this)} onChange={this.handleChange.bind(this)} />
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  <table id="userTable" className="table card-table table-vcenter text-nowrap table-sm">
                    <thead>
                      <tr>
                        <th width="70px">{strings.NO}.</th>
                        <th width="70px">{strings.Avatar}</th>
                        <th>{strings.Name}</th>
                        <th>{strings.Email}</th>
                        <th>{strings.Register}</th>
                        <th>{strings.Status}</th>
                        <th>{strings.Action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 text-center">
                  <Pagination
                    activePage={this.state.pageIndex}
                    itemsCountPerPage={10}
                    totalItemsCount={this.state.totalCount}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    prevPageText="Prev"
                    nextPageText="Next"
                    firstPageText="First"
                    lastPageText="Last"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}