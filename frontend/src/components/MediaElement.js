import React from 'react'
import Common from '../Common'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import "../styles/ReactCarousel.css";
import { Carousel } from 'react-responsive-carousel';
import Dropdown from 'react-dropdown'
import '../styles/MediaElement.css'
import { strings } from '../Localization';


const DEFAULT_EMPTY = '/assets/images/empty.png';

export class MediaElement extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {}
  }
  

  onError(event) {
    $(event.target).attr('src', DEFAULT_EMPTY);
  }

  handleOrderChange(event) {
    let item = this.props.data;
    item.order_number = event.target.value;
    this.props.onOrderChange(item.id, event.target.value);
  }

  handleDeleteFromPlaylist(id) {
    this.props.onDeleteFromPlaylist(id);
  }

  handleGroupChange(event, playlistelement_id) {
    this.props.onChangeGroup(event.value, playlistelement_id);
  }

  handleKeyDown(event) {
    if(event.key === 'Enter') {
      this.props.onSaveOrder();
    }
  }

  componentDidMount() {
    // let self = this;
    // $('#playlist-media-' + this.props.data.id).on('focusout', function() {
    //   self.props.onSaveOrder();
    // });
  }

  render() {
    let self = this;
    const item = this.props.data;
    
    const playlistMedia = this.props.playlistMedia;
    item.type = parseInt(item.type);
    let type_name = Common.typeName(item.type);
    let mode = this.props.mode;
    let className = "col-sm-12 col-md-6 col-lg-4";
    if(mode === 'select') className = "col-sm-6 col-md-4 col-lg-3";
    if (playlistMedia) className = "playlist-element";
    let name = "";
    let filename_limit = mode === 'select' ? 12 : Common.FILENAME_LIMIT;
    filename_limit = playlistMedia ? 100 : filename_limit;
    let url_limit = mode === 'select' ? 15 : Common.URL_LIMIT;
    url_limit = playlistMedia ? 50 : url_limit;
    let edit_path = '';
    let gallery_slides = [];
    if(item.type === 1) {
      name = Common.mediaFilename(item.filename, filename_limit);
      edit_path = '/media/video_form/' + item.id;
    } else if(item.type === 2) {
      name = Common.mediaFilename(item.filename, filename_limit);
      edit_path = '/media/image_form/' + item.id;
    } else if(item.type === 3) {
      item.filename = item.filename.replace('upload/', '');
      name = item.filename;
      edit_path = '/media/gallery_form/' + item.id;
      
      gallery_slides = item.files.map(function(file_item, i) {
        let media_path = Common.mediaUrl('upload/' + item.filename + '/' + file_item.basename);
        return (
          <div key={media_path}>
            {file_item.extension === 'mp4' ?
              <video width="100%" controls>
                <source src={media_path} type="video/mp4" />
              </video>
              :
              <img className="d-block w-100" src={media_path} alt="" />
            }
          </div>
        );
      });
    } else if(item.type === 4) {
      name = Common.mediaWebsiteUrl(item.filename, url_limit);
      edit_path = '/media/website_form/' + item.id;
    }
    let tickerGroups = [];
    if (playlistMedia) {
      tickerGroups.push({ value: 0, label: '[No Ticker Group]' });
      for (let i = 0; i < this.props.tickerGroups.length; i++) {
        let item = this.props.tickerGroups[i];
        tickerGroups.push({ value: item.id, label: item.group_name });
      }
    }
    let tickerGroup = null;
    if (item.ticker_group) {
      tickerGroup = {
        value: item.ticker_group.id,
        label: item.ticker_group.group_name,
      }
    }
    let mediaContent;
    if(item.type === 1) {
      mediaContent = (
        <Link to="#" className="mb-3">
          <video width="100%" controls>
            <source src={Common.mediaUrl(item.filename)} type="video/mp4" />
          </video>
        </Link>
      );
    } else if (item.type === 2) {
      mediaContent = (
        <a href={Common.mediaUrl(item.filename)} target="_new" className="mb-3">
          <img src={Common.mediaUrl(item.filename)} alt="" className="rounded media-image" onError={self.onError.bind(self)} />
        </a>
      );
    } else if (item.type === 3) {
      if(item.files.length === 0) {
        mediaContent = (
          <Link to="#" className="mb-3">
            <img src="/assets/images/album.png" alt="" className="rounded" />
          </Link>
        );
      } else {
        mediaContent = (
          <Link to="#" className="mb-3">
            <Carousel showArrows={true} showThumbs={false} showIndicators={false} autoPlay={true} infiniteLoop={true} interval={5000}>
              {gallery_slides}
            </Carousel>
          </Link>
        );
      }
    } else if (item.type === 4) {
      mediaContent = (
        <a href={item.filename} target="_new" className="mb-3">
          <img src="/assets/images/website.png" alt="" className="rounded" />
        </a>
      );
    }

    var sec = item.duration / 1000;

    let miniInfo = (
      <div>
        <small className="d-block text-muted">{Common.diff(item.created_at)} {strings.ago}</small>
        {item.type !== 1 ?
          <small className="d-block text-muted">{strings.Duration}: {sec.toFixed(1)}s</small>
          : null}
        {!Common.isNone(item.audio_source) ?
          <small className="d-block text-muted">
            {strings.Audio}: {Common.audioTypeName(item.audio_source)}
          </small>
          : null}
      </div>
    );
    
    return (
      <div className={className}>
        <div className="card p-3">
          {playlistMedia ?
            <div className="row">
              <div className="col-sm-12 col-md-4 col-lg-3">
                {mediaContent}
              </div>
              <div className="col-sm-12 col-md-8 col-lg-9">
                
                <div className="row">
                  <div className="col-md-6">
                    <label className="text-muted">{type_name}</label>
                    <div className="row mb-2 text-center media-element-control">
                      <div className="col-1">
                        <label><i className="fe fe-link" style={{ verticalAlign: 'text-bottom' }}></i></label>
                      </div>
                      <div className="col-10 media-element-dropdown">
                        <Dropdown
                          options={tickerGroups}
                          onChange={(event) => this.handleGroupChange(event, item.playlistelement_id)}
                          value={tickerGroup}
                        />
                      </div>
                    </div>
                    <div className="row mb-2 text-center media-element-control">
                      <div className="col-1">
                        <label><i className="fa fa-sort-numeric-asc" style={{ verticalAlign: 'text-bottom' }}></i></label>
                      </div>
                      <div className="col-4">
                        <input className="form-control" style={{ height: 27, padding: 5 }} type="number" min="0" id={'playlist-media-' + item.id}
                          value={item.order_number} onChange={this.handleOrderChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)} />
                      </div>
                      <div className="col-6">
                        <button className="btn btn-sm btn-secondary btn-block"
                          onClick={this.handleDeleteFromPlaylist.bind(this, item.id)}>
                          <i className="fe fe-trash"></i> {strings.Remove}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    {name}
                    {miniInfo}
                  </div>
                </div>
              </div>
            </div>
            :
            <div className="row">
              <div className="mb-1">
                {mediaContent}
              </div>
              <div className={mode !== 'select' ? "col-8" : "col-12"}>
                <div>
                  <div>
                    {mode === 'select' ?
                      <label className="custom-control custom-checkbox">
                        <input id={"element-checkbox-" + item.id} type="checkbox" className="custom-control-input media-element-checkbox"
                          data-id={item.id} />
                        <span className="custom-control-label float-left">{name}</span>
                      </label>
                      :
                      name
                    }
                  </div>
                  {mode !== 'select' ?
                    miniInfo
                    :
                    <small className="d-block text-muted float-left">{type_name}</small>
                  }
                </div>
              </div>
              <div className={mode !== 'select' ? "col-4" : ""}>
                {mode !== 'select' ?
                  <div className="ml-auto text-muted">
                    <Link to="#" className="icon mb-1 float-right">
                      {type_name}
                    </Link>
                    <br />
                    {!playlistMedia && this.props.loggedIn ?
                      <Link to={edit_path} className="icon float-right">
                        <i className="fe fe-edit"></i> {strings.Edit}
                      </Link>
                      : null}
                  </div>
                  : null}
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}