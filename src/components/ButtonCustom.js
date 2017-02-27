import React, { Component } from 'react';

export default class ButtonCustom extends Component {
  render() {
    return(
      <div className="pure-control-group">
        <label></label>
        <button type="submit"
               className="pure-button pure-button-primary">
          {this.props.value}
          </button>
      </div>
    );
  }
}