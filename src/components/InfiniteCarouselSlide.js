import React, {
  Component,
  PropTypes,
} from 'react';

import Image from './Image';

class InfiniteCarouselSlide extends Component {

  render() {
    return (
      <div className={this.props.className}>
        <Image imageUrl='https://placeholdit.imgix.net/~text?txtsize=20&txt=215%C3%97215&w=215&h=215' />
        <h3>{'This is a title'}</h3>
      </div>
    );
  }
}

InfiniteCarouselSlide.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default InfiniteCarouselSlide;