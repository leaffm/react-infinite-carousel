import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselDots extends Component {

  getDotsStyle = () => {};

  getDotStyle = () => {};

  render() {
    let dots = [];
    for (let i=0; i < this.props.numberOfDots; i++) {
      dots.push(
        <li 
          key={i + 1}
          data-index={i}
        >
          <a 
            href='#'
            onClick={this.props.onClick}
          >
            {i + 1}
          </a>
        </li>
      );
    }

    return (
      <ul className='dots'>
        {dots}
      </ul>
    );
  }
}

InfiniteCarouselDots.propTypes = {
  numberOfDots: PropTypes.number,
  onClick: PropTypes.func
};

export default InfiniteCarouselDots;