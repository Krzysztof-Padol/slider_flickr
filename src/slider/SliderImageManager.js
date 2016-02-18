import {PathBuilder} from '../Flickr/PathBuilder';
import {SliderBuilder} from './SliderBuilder';
import {SliderResource} from './SliderResource';

var DEFAULT_SLIDES_PER_REQUEST = 15;
var DEFAULT_SEARCH_TEXT = 'landscape';
var DEFAULT_INTERVAL_TIME = 5000;

/**
* Class handle logic of:
* - showing proper slides
* - moving prev/next
* - showing/hiding thumbnails
* - refreshing thumbnails
*/
class SliderImageManager {
    constructor(sliderCore, domEls, config = {}) {
        // number of slides loaded per one request
        config.slidesPerRequest = config.slidesPerRequest || DEFAULT_SLIDES_PER_REQUEST;
        config.searchText = config.searchText || DEFAULT_SEARCH_TEXT;
        this.intervalTime = config.intervalTime || DEFAULT_INTERVAL_TIME;

        if (this.intervalTime < 1000) {
            this.intervalTime  = 1000;
        }
        
        this.currentIndex = 0;
        this.interval = false;
        this.slides = domEls.slides;

        this.thumbnailContainer = domEls.thumbnailContainer;
        this.descriptionContainer = domEls.description;

        // Creating instance for slider resource
        this.sliderResource = new SliderResource(config, config.searchText);

        // Load images from resource
        this.sliderResource.getImages()
            .then(() => {
                // When you get images initialize slider
                this.initImages();
                this.initThumbnails();
                this.updateDescription(0);
                // Setup timer for carusel animation
                this.startCarousel();
            });
    }

    /**
    * Is it last slide in whole data?
    * @return {Boolean} return true if that is last slide
    */
    isLastSlide() {
        return this.currentIndex + 1 === this.sliderResource.totalSlides;
    }

    /**
    * Starting timer
    */
    startCarousel() {
        // Start timer if slider doesn't loading next part of images
        if (!this.sliderResource.loading) {
            this.interval = setTimeout(() => this.next.call(this), this.intervalTime);
        } else {
            // If slider loading next part of images
            // wait for the end
            this.sliderResource.onLoad()
                .then(() => {
                    this.startCarousel();
                });
        }
    }

    /**
    * Stop timer for carousel
    * @return {Boolean} return true if timer is stopped / false when it was already stop
    */
    stopCarousel() {
        if(!this.interval) {
            return false;
        }

        clearTimeout(this.interval);
        this.interval = false;

        return true;
    }

    /**
    * Set image for DOM object based on destination index and flickr path builder
    * @param {HTMLElement} dest         destination DOM element
    * @param {Number} index             index of image in resource object
    * @param {Function} PathBuilderMethod method for creating path of image based on object fetched
    *                                   from slider resource
    */
    setImage(dest, index, PathBuilderMethod) {
        var imageSrc;
        var image;

        if (index >= 0 && index < this.sliderResource.totalSlides) {
            image = this.sliderResource.getImage(index);
            imageSrc = PathBuilderMethod(
                image.farm, image.server, image.id || image.flickrId, image.secret
            );

            dest.setImage(imageSrc);
        }
    }

    /**
    * Init current and next image in array
    * @return {null} null
    */
    initImages() {
        var i = 0;
        var order = ['current', 'next'];

        for(;(i < this.sliderResource.totalSlides) && (i < 2); i++) {
            this.setImage(this.slides[order[i]], this.currentIndex + i, PathBuilder.large);
        }
    }



    /**
    * Init thumbnails DOM elements
    * @return {[type]} [description]
    */
    initThumbnails() {
        function addOnClick(direction) {
            this.thumbnailContainer[direction].thumbnail.addEventListener('click', (e) => {
                e.stopPropagation();
                this[direction]();
            }, false);
        }

        // Initialize just next thumbnail
        if(this.sliderResource.totalSlides >= 2) {
            this.setImage(this.thumbnailContainer.next.thumbnail, 1, PathBuilder.thumbnail);
        }

        // Add event listeners on click
        addOnClick.call(this, 'next');
        addOnClick.call(this, 'prev');
    }

    /**
    * Init description for first 
    * @return {null} null
    */
    updateDescription(index) {
        var photo = this.sliderResource.getImage(index);

        if (photo !== undefined && photo.title) {
            this.descriptionContainer.setTitle(photo.title);
            this.descriptionContainer.show();
        } else {
            this.descriptionContainer.hide();
        }
    }

    /**
    * Update thumbnails method
    */
    updateThumbnail() {
        // If index is bigger or equal 1 set previous image thumbnail
        if (this.currentIndex >= 1) {
            this.setImage(
                this.thumbnailContainer.prev.thumbnail,
                this.currentIndex - 1,
                PathBuilder.thumbnail
            );
            // otherwise hide it
        } else {
            this.thumbnailContainer.prev.thumbnail.hide();
        }

        // If it is last slide hide next thumbnail
        if (this.isLastSlide()) {
            this.thumbnailContainer.next.thumbnail.hide();
            // otherwise set next thumbnail
        } else {
            this.setImage(
                this.thumbnailContainer.next.thumbnail,
                this.currentIndex + 1,
                PathBuilder.thumbnail
            );
        }
    }

    /**
    * Function executed during css animation end
    * @param  {Function} next direction (true - forward, false - backward)
    */
    transitionEnd(next) {
        // Get hidden class element
        var slide = next ? this.slides.next : this.slides.prev;
        // Set new class for hidden DOM element
        slide.className = SliderBuilder.getSlideClassName(next ? 'next' : 'prev');

        // Set image for next/prev element
        this.setImage(
            slide,
            next ? this.currentIndex + 1 : this.currentIndex - 1,
            PathBuilder.large
        );

        // remove event listener
        this.listenElementOnEnd.removeEventListener('transitionend', this.transitionEndFn);
        // start timer for next iteration
        this.startCarousel();
    }

    /**
    * Taking care about moving slides
    * @param  {Function} next true if next / flase if prev
    */
    move(next) {
        // If that is last slide and moving forward stop it.
        // or if timer is already stoped (slider is already moving)
        if((this.isLastSlide() && next) || !this.stopCarousel()) {
            return;
        }

        // save reference to prev or next element
        this.listenElementOnEnd = next ? this.slides.next : this.slides.prev;

        // set elements new css classes and update references in slides obj
        if (next) {
            this.slides.prev.className = SliderBuilder.getSlideClassName('next')
                + ' cool-slider__slide--hide';
            this.slides.current.className = SliderBuilder.getSlideClassName('prev');
            this.slides.next.className = SliderBuilder.getSlideClassName('current');

            this.currentIndex++;

            this.slides = {
                prev: this.slides.current,
                current: this.slides.next,
                next: this.slides.prev,
            };
            // for moving backwards
        } else {
            this.slides.prev.className = SliderBuilder.getSlideClassName('current');
            this.slides.current.className = SliderBuilder.getSlideClassName('next');
            this.slides.next.className = SliderBuilder.getSlideClassName('prev')
                + ' cool-slider__slide--hide';

            this.currentIndex--;

            this.slides = {
                prev: this.slides.next,
                current: this.slides.prev,
                next: this.slides.current
            };
        }

        this.updateThumbnail();
        this.updateDescription(this.currentIndex);
        this.transitionEndFn = this.transitionEnd.bind(this, next);
        // Listen on css animation end
        this.listenElementOnEnd.addEventListener('transitionend', this.transitionEndFn, false);
    }

    next() {
        this.move(true);
    }

    prev() {
        this.move(false);
    }

    destroy() {
        this.stopCarousel();
        this.listenElementOnEnd.removeEventListener('transitionend', this.transitionEndFn);
        this.listenElementOnEnd = null;

        delete this.slides.prev;
        delete this.slides.current;
        delete this.slides.next;

        delete this.thumbnailContainer.next.thumbnail;
        delete this.thumbnailContainer.next.container;

        delete this.thumbnailContainer.prev.thumbnail;
        delete this.thumbnailContainer.prev.container;
    }
}

export {SliderImageManager};

