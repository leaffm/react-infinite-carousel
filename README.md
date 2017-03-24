# react-infinite-carousel
React simple infinite carousel with lazy loading and responsive support.

### Installation

```bash
npm install react-infinite-carousel
```

### Example

```js
import React from 'react';
import ReactDOM from 'react-dom';

import InfiniteCarousel from 'react-infinite-carousel';

ReactDOM.render(
  <InfiniteCarousel
  	dots={true}
	slidesToShow={4}
	slidesToScroll={4}
  >
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=55b64e&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ef4d9c&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00f3d1&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=00ffff&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
    <div>
      <img src='https://placeholdit.imgix.net/~text?txtsize=20&bg=ee1f34&txtclr=ffffff&txt=215%C3%97215&w=215&h=215'/>
    </div>
  </InfiniteCarousel>
, 
document.getElementById('root'));
```

### Properties

|    Property    	 | Type |          Description          | Default |
| ------------------ | ---- |          -----------          | ------- |
| arrows         	 | bool | Enables tabbing and arrow key navigation | true |
| dots      	 	 | bool | Enable dot pagination | false |
| lazyLoad		 	 | bool | Lazy load slides that are not visible at first load | true |
| swipe          	 | bool | Add swipe event to scroll between slide pages | true |
| animationDuration  | int | Slide animation duration | 500 |
| slidesToShow       | int | Number of slides to display | 1
| slidesToScroll     | int | Number of slides to scroll | 1 |
| slidesSpacing  	 | int | Margin between slides | 10 |
| autoCycle     	 | bool | Enables autocycle between slide pages | false |
| cycleInterval      | bool | Autocycle interval duration | 5000 |
| pauseOnHover       | bool | Pauses autocycle | true |
| responsive      	 | bool | Enables breakpoints | true |
| breakpoints        | array | Array of objects in the form of ```{ breakpoint: int, settings: { ... } }```  | [] |
| placeholderImageSrc| string | Go to slide on click | ```data:image/gif;base64,R0lGODlhAQABAIABAEdJRgAAACwAAAAAAQABAAACAkQBAA==``` |
