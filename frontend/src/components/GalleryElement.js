import React from 'react'
import Common from '../Common';
import { strings } from '../Localization';


export class GalleryElement extends React.Component {

  handleDelete(file) {
    if (typeof this.props.onDelete === 'function') {
      this.props.onDelete(file);
    }
  }
  
  render() {
    const folder = this.props.folder;
    const item = this.props.data;
    const type = item.extension === 'mp4' ? 'video' : 'image';
    const fullPath = Common.BACKEND + '/' + folder + '/' + item.basename;

    return (
      <div className="col-sm-12 col-md-6 col-lg-6">
        <div className="card p-3">
          <div className="row">
            <div className="col-sm-6">
              {type === 'image' ?
                <img src={fullPath} alt="" />
              :
                <video width="100%" controls>
                  <source src={fullPath} type="video/mp4" />
                </video>
              }
            </div>
            <div className="col-sm-6">
              <div className="text-right mb-2">
                <button className="btn btn-secondary btn-sm" onClick={this.handleDelete.bind(this, item.basename)}>
                  <i className="fe fe-trash"></i> {strings.Remove}
                </button>
              </div>
              {item.basename}
            </div>
          </div>
        </div>
      </div>
    );
  }
}