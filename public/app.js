import React from 'react';
import ReactDOM from 'react-dom';

import InfiniteCarousel from '../src/index';

React.initializeTouchEvents && React.initializeTouchEvents(true);
ReactDOM.render(
  <InfiniteCarousel
    dots
    paging
    scrollOnDevice
    showSides
    breakpoints={[
      {
        breakpoint: 500,
        settings: {
          slidesToScroll: 2,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToScroll: 3,
          slidesToShow: 3,
        },
      },
    ]}
    sideSize={0.1}
    sidesOpacity={0.5}
    slidesToScroll={4}
    slidesToShow={4}
    onNextClick={() => { console.log('onNextClick'); }}
    onPreviousClick={() => { console.log('onPreviousClick'); }}
  >
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=55b64e&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ef4d9c&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00f3d1&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00ffff&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ee1f34&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=91b4c0&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ff6347&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ebbfbf&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=def1f9&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=cdf2c6&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=9fa616&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=2c4caa&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=44e3e1&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ff6666&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=94e1e3&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=29083c&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ffff99&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=616161&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
    <div>
      <img
        alt=''
        src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ed7ebe&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'
      />
    </div>
  </InfiniteCarousel>,
  document.getElementById('root'),
);
