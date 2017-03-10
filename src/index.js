import React from 'react';
import ReactDOM from 'react-dom';

import InfiniteCarousel from './components/InfiniteCarousel.js';

ReactDOM.render(
	<InfiniteCarousel>
		<div>
      <div>
        <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=55b64e&txtclr=ffffff&txt=215%C3%97215&w=215&h=215' />
      </div>
      <h3>{'This is a title'}</h3>
    </div>
    <div>
      <div>
        <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215' />
      </div>
      <h3>{'This is a title'}</h3>
    </div>
    <div>
      <div>
        <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ef4d9c&txtclr=ffffff&txt=215%C3%97215&w=215&h=215' />
      </div>
      <h3>{'This is a title'}</h3>
    </div>
    <div>
      <div>
        <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00f3d1&txtclr=ffffff&txt=215%C3%97215&w=215&h=215' />
      </div>
      <h3>{'This is a title'}</h3>
    </div>
    <div>
      <div>
        <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00ffff&txtclr=ffffff&txt=215%C3%97215&w=215&h=215' />
      </div>
      <h3>{'This is a title'}</h3>
    </div>
	</InfiniteCarousel>, 

	document.getElementById('root'));