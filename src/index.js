import React from 'react';
import ReactDOM from 'react-dom';

import InfiniteCarouselSlide from './components/InfiniteCarouselSlide';
import InfiniteCarousel from './components/InfiniteCarousel.js';

ReactDOM.render(
	<InfiniteCarousel>
		<InfiniteCarouselSlide className={'CarouselSlide'} />
    <InfiniteCarouselSlide className={'CarouselSlide'} />
    <InfiniteCarouselSlide className={'CarouselSlide'} />
    <InfiniteCarouselSlide className={'CarouselSlide'} />
    <InfiniteCarouselSlide className={'CarouselSlide'} />
    <InfiniteCarouselSlide className={'CarouselSlide'} />
	</InfiniteCarousel>, 

	document.getElementById('root'));