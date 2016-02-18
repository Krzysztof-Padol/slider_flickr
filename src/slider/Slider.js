import {SliderBuilder} from './SliderBuilder';
import {SliderImageManager} from './SliderImageManager';

var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var DEFAULT_BACKGROUND_SIZE = 'cover';

var onArrows = function (e) {
    var e = e || window.event;

    if (e.keyCode === KEY_LEFT) {
        this.prev();
    } else if (e.keyCode === KEY_RIGHT) {
        this.next();
    }
};

/**
* Main Slider class
*/
class Slider {
    constructor(el, config = {}) {
        config.backgroundSize = config.backgroundSize || DEFAULT_BACKGROUND_SIZE;

        // Creating DOM elements
        this.domEls = SliderBuilder.createDom(config.backgroundSize);
        if (el) {
            el.appendChild(this.domEls.mainContainer);
        }

        // Initialize slider manager
        this.imageManager = new SliderImageManager(this, this.domEls, config);

        document.addEventListener('keyup', onArrows.bind(this));
    }

    /**
     * Expose next slide function
     * @return {null} [null]
     */
    next() {
        this.imageManager.next();
    }

    /**
     * Expose prev slide function
     * @return {null} null
     */
    prev() {
        this.imageManager.prev();
    }

    destroy() {
        this.imageManager.destroy();

        document.removeEventListener('keyup', onArrows.bind(this));
        domEls.mainContainer.parentNode.removeChild(this.domEls.mainContainer);

        delete domEls.mainContainer;
    }
};

export {Slider};
