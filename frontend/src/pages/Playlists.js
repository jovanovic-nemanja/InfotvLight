import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import Pagination from "react-js-pagination"
import { Link } from 'react-router-dom'
import App from '../App';
import { strings } from '../Localization';


export class Playlists extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      playlistSource: [],
      pageIndex: 1,
      totalCount: 0,
      search: '',
      from: 0,
      to: 0
    }
  }

  componentDidMount() {
    this.getPlaylists(1);
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

  getPlaylists(pageIndex = null) {
    if(pageIndex === null) pageIndex = this.state.pageIndex;
    let url = Common.BACKEND + '/api/playlists';
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

        console.log('playlists', data);
        self.setState({
          playlistSource: data.data,
          totalCount: data.total,
          pageIndex: pageIndex,
          from: data.from,
          to: data.to
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onSearch = () => {
    let self = this;
    window.setTimeout(function () {
      self.getPlaylists();
    }, 10);
  }

  handlePageChange(pageNumber) {
    this.getPlaylists(pageNumber);
  }

  handleDelete(id) {
    let self = this;
    App.confirm(strings.AreYouSureToDeleteThisPlaylist, function() {
      let url = Common.BACKEND + '/api/playlists';
      url += '/' + id;
      url += '?token=' + Common.getToken();

      $('.loading').show();
      $.ajax({
        url: url,
        method: 'DELETE',
        success: function (data) {
          $('.loading').hide();

          Common.notify('success', strings.ThePlaylistHasBeenDeleted);
          self.getPlaylists();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  render() {
    let self = this;
    let playlists = this.state.playlistSource.map(function (item, i) {
      let index = (self.state.pageIndex - 1) * 10 + i + 1;

      return (
        <tr key={item.id} style={{ verticalAlign: 'middle' }}>
          <td className="text-center">
            <span className="text-muted">{index}</span>
          </td>
          <td>
            <Link to={'/playlists/' + item.id}>
              {item.name}
            </Link>
          </td>
          <td>
            {item.positionX}, {item.positionY}
          </td>
          <td>
            {item.width} X {item.height}
          </td>
          <td>{item.elements.length}</td>
          <td>{Common.humanDate(item.created_at)}</td>
          <td>
            <Link to="#" className="icon ml-2" onClick={self.handleDelete.bind(self, item.id)}>
              <i className="fe fe-trash"></i>
            </Link>
          </td>
        </tr>
      )
    });

    return(
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.ManagePlaylists}</h1>
              <div className="page-subtitle">{this.state.from} - {this.state.to} {strings.of} {this.state.totalCount} {strings.playlists}</div>
              <div className="page-options d-flex">
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <i className="fe fe-search"></i>
                  </span>
                  <input type="text" className="form-control w-10" placeholder={strings.Search + ' ' + strings.playlist}
                    name="search" value={this.state.search} onKeyUp={this.handleSearch.bind(this)} onChange={this.handleChange.bind(this)} />
                </div>
                <Link className="btn btn-primary ml-4" to="/playlists/0">
                  <i className="fa fa-plus"></i> {strings.NewPlaylist}
                </Link>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row mt-5">
                  <div className="col-md-12">
                    <table className="table table-striped table-sm">
                      <thead>
                        <tr>
                          <th width="50px" className="text-center">{strings.NO}.</th>
                          <th>{strings.Name}</th>
                          <th>{strings.Position}</th>
                          <th>{strings.Size}</th>
                          <th>{strings.Media} {strings.Count}</th>
                          <th>{strings.CreatedAt}</th>
                          <th width="50px"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {playlists}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="text-center" style={{marginBottom: 20}}>
                <Pagination
                  activePage={this.state.pageIndex}
                  itemsCountPerPage={10}
                  totalItemsCount={this.state.totalCount}
                  pageRangeDisplayed={5}
                  onChange={this.handlePageChange.bind(this)}
                  prevPageText={strings.Prev}
                  nextPageText={strings.Next}
                  firstPageText={strings.First}
                  lastPageText={strings.Last}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}