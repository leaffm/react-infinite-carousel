import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselArrow extends Component {

  getArrowStyles = () => {
    const left = this.props.next ? 'auto' : '15px';
    const right = this.props.next ? '15px' : 'auto';
    return {
      display: 'block',
      position: 'absolute',
      top: '50%',
      left: left,
      right: right,
      zIndex: '2',
      transform: 'translateY(-50%)'
    };
  };

  getIconStyles = () => {
    const transform = this.props.next ? 'rotate(-45deg)' : 'rotate(135deg)';
    return {
      display: 'inline-block',
      padding: '10px',
      border: 'solid #E5E5E5',
      borderWidth: '0 10px 10px 0',
      transform: transform
    };
  };

  render() {
    const className = `arrow ${ this.props.next ? 'left' : 'right' }`;
    return (
      <div          
          className='arrow'
          onClick={this.props.onClick}
          style={this.getArrowStyles()}
      >
        <a
            className='icon'
            href='#'
        >
          <i 
              className={`${className} ${this.props.className}`}
              style={this.getIconStyles()}
          />
        </a>
      </div>
    );
  }
}

InfiniteCarouselArrow.propTypes = {
  className: PropTypes.string,
  next: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

InfiniteCarouselArrow.defaultProps = {
  next: true
};

export default InfiniteCarouselArrow;