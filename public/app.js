import React from 'react';
import ReactDOM from 'react-dom';

import InfiniteCarousel from '../src/index';

React.initializeTouchEvents && React.initializeTouchEvents(true); // eslint-disable-line no-unused-expressions
ReactDOM.render(
  <InfiniteCarousel
    swipe
    autoCycle
    lazyLoad
    dots
    paging
    showSides
    breakpoints={[
      {
        breakpoint: 768,
        settings: {
          slidesToScroll: 2,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1200,
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
    onNextClick={() => {}}
    onPreviousClick={() => {}}
  >
    <div>
      <img alt="" src="https://place-hold.it/215x215/55b64e/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/904098/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ef4d9c/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/00f3d1/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/00ffff/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ee1f34/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/91b4c0/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ff6347/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ebbfbf/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/def1f9/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/cdf2c6/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/9fa616/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/2c4caa/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/44e3e1/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ff6666/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/94e1e3/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/29083c/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ffff99/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/616161/fff&fontsize=20" />
    </div>
    <div>
      <img alt="" src="https://place-hold.it/215x215/ed7ebe/fff&fontsize=20" />
    </div>
  </InfiniteCarousel>,
  document.getElementById('root')
);
