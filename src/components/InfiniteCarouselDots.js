import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselDots extends Component {

  getDotsStyle = () => {
    return {
      position: 'absolute',
      left: '50%',
      bottom: '0',
      padding: '0',
      transform: 'translateX(-50%)'
    };
  };

  getDotStyle = () => {
    return {
      display: 'inline-block',
      listStyle: 'none',
      margin: '0 5px',
      cursor: 'pointer'
    };
  };

  getIconStyle = (active) => {
    const color = active ? '#48799a' : '#E5E5E5';
    return {
      display: 'block',
      backgroundColor: color,
      width: 10,
      height: 10,
      borderRadius: '50%'
    };
  };

  render() {
    let dots = [];
    for (let i=0; i < this.props.numberOfDots; i++) {
      dots.push(
        <li 
            className={i === this.props.activePage ? 'active' : ''}
            data-index={i}
            key={i + 1}
            onClick={this.props.onClick}
            style={this.getDotStyle()}
        >
          <i 
            className='dot'
            style={this.getIconStyle(i === this.props.activePage)}
          />
        </li>
        );
    }

    return (
      <ul 
          className='dots'
          style={this.getDotsStyle()}
      >
        {dots}
      </ul>
    );
  }
}

InfiniteCarouselDots.propTypes = {
  numberOfDots: PropTypes.number,
  activePage: PropTypes.number,
  onClick: PropTypes.func
};

export default InfiniteCarouselDots;