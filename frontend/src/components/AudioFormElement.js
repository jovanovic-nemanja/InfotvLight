import React from 'react'
import { strings } from '../Localization';
import Dropdown from 'react-dropdown'
import '../styles/AudioFormElement.css'


export class AudioFormElement extends React.Component {

  handleChange(event) {
    this.props.onAudioChange(event.target.name, event.target.value);
  }

  handleAudioTypeChange(event) {
    this.props.onAudioChange('audio_source', event.value);
  }

  render() {
    let audio_source = parseInt(this.props.audio_source);
    let duration = this.props.duration;
    if(duration === null) duration = '';
    const audioTypes = [
      { label: 'Radio Sound', value: 0 },
      { label: 'Own Audio', value: 1 },
    ];
    let audioType = audioTypes[audio_source];

    return(
      <div>
        <table style={{width: '100%'}}>
          <tbody>
            <tr>
              <td width="45%" className="audio-type-container">
                <Dropdown
                  options={audioTypes}
                  onChange={(event) => this.handleAudioTypeChange(event)}
                  value={audioType}
                />
              </td>
              <td>
                <div className="input-icon ml-1">
                  <span className="input-icon-addon">
                    <i className="fe fe-clock"></i>
                  </span>
                  <input type="number" className="form-control w-10 mb-2" placeholder={strings.TypeDuration}
                    name="duration" value={duration} onChange={this.handleChange.bind(this)} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}