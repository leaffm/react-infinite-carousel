import React, {Component} from 'react';
 
class Image extends Component {
  constructor(props) {
    super(props);
    this.state = { imageStatus: 'loading' };
  }
 
  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }
 
  handleImageErrored() {
    this.setState({ imageStatus: 'failed to load' });
  }
 
  render() {
    return (
      <div>
        <img
          src={this.props.imageUrl}
          onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleImageErrored.bind(this)}
          />
      </div>
    );
  }
}

export default Image;