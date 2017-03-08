import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselDots extends Component {

  render() {
    let dots = [];
    for (let i=0; i < this.props.numberOfDots; i++) {
      dots.push(<li key={i + 1} />);
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