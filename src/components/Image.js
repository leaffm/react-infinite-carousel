import React, {
  Component,
  PropTypes
} from 'react';
 
class Image extends Component {

  static propTypes = {
    imagePlaceholder: PropTypes.string.isRequired,
    imageSrc: PropTypes.string.isRequired,
    imageSrcRetina: PropTypes.string
  };

  static defaultProps = {
    lazyLoaded: false
  };

  constructor(props) {
    super(props);
    
    this.state = {
      imageStatus: 'loading'
    };
  }
 
  handleImageLoaded() {
    this.setState({ imageStatus: 'loaded' });
  }
 
  handleImageErrored() {
    this.setState({ imageStatus: 'failed to load' });
  }
 
  render() {
    let src = this.props.imagePlaceholder;
    if (this.props.lazyLoaded) {
      src = this.props.imageSrc;
    }

    return (
      <img
        src={src}
        data-src={this.props.imageSrc}
        data-src2x={this.props.imageSrcRetina}
        data-placeholder={this.props.imagePlaceholder}
        onLoad={this.handleImageLoaded.bind(this)}
        onError={this.handleImageErrored.bind(this)}
        data-lazyloaded={this.props.lazyLoaded}
        />
    );
  }
}

export default Image;