/**
 * Function used for changing src on element when
 * image is already loaded
 * @param  {HTMLElement}  el       Destination DOM element
 * @param  {String}  imageSrc Loading image path
 * @param  {Boolean} spinner  true if there spinner should be shown during loading
 * @return {null} nothing
 */
function onImageLoad(el, imageSrc, spinner = true) {
    var newImg = new Image();

    if (spinner) {
        el.style.backgroundImage = 'url(\'./images/spinner.gif\')';
    }

    newImg.onload = function () {
        el.style.backgroundImage = `url('${imageSrc}')`;
    };

    newImg.src = `${imageSrc}`;
}

/**
 * Common function  for creating DOM elements for slider
 * @type {Object}
 */
var SliderBuilder = {
    /**
    * Append array of do elements
    * @param  {HTMLElement} el    destination DOM element
    * @param  {Array} array array of DOM elements
    */
    appendArrayOfElements(el, array) {
        for(var key in array) {
            if (array.hasOwnProperty(key)) {
                el.appendChild(array[key]);
            }
        }
    },

    /**
    * Main function
    * @param  {String} backgroundSize It is css background sie property
    * @return {Object}                object with references to main elements
    */
    createDom(backgroundSize) {
        var el = document.createElement('section');
        var slides;
        var description;
        var thumbnailContainer;
        var thumbnailContainerArray;

        // main container class
        el.className = 'cool-slider ' + (backgroundSize ? `cool-slider--${backgroundSize}` : '');

        // creating slides container
        slides = {
            prev: this.createSlide('prev'),
            current: this.createSlide('current'),
            next: this.createSlide('next')
        };

        // creating thumbnail container
        thumbnailContainer = {
            prev: this.createThumbnailContainer('prev'),
            next: this.createThumbnailContainer('next')
        };
        thumbnailContainerArray = [
            thumbnailContainer.prev.container,
            thumbnailContainer.next.container
        ];

        // Appending elements to main container
        this.appendArrayOfElements(el, slides);
        this.appendArrayOfElements(el, thumbnailContainerArray);

        description = this.createDescription();
        el.appendChild(description);

        return {
            mainContainer: el,
            slides,
            description,
            thumbnailContainer
        };
    },

    /**
    * Create slide container function
    * @param  {String} order prev/current/next
    * @return {DOM}       DOM element
    */
    createSlide(order = 'current') {
        var el = document.createElement('div');

        el.style.backgroundImage = 'url(\'./images/spinner.gif\')';

        el.setImage = function (imageSrc) {
            onImageLoad(el, imageSrc);
        };

        el.className = this.getSlideClassName(order);

        return el;
    },

    /**
    * Create descrtiption container
    * @return {DOM}       DOM element
    */
    createDescription() {
        var el = document.createElement('div');
        el.className = this.getDescriptionClassName();

        el.hide = function () {
            el.classList.add('cool-slider__description--hide');
        };

        el.show = function () {
            el.classList.remove('cool-slider__description--hide');
        };

        el.setTitle = function (title) {
            el.innerText = title;
        };

        return el;
    },

    /**
    * Create thumbnail container fn
    * @param  {String} order prev/current/next
    * @return {DOM}       DOM element
    */
    createThumbnailContainer(order = 'prev') {
        var el = document.createElement('div');
        var thumbnail;

        el.className = this.getThumbnailContainerClassName(order);

        el.hide = function () {
            el.classList.add('cool-slider__container-thumbnail--hide');
        };

        el.show = function () {
            el.classList.remove('cool-slider__container-thumbnail--hide');
        };

        thumbnail = this.createThumbnail(order);
        el.appendChild(thumbnail);
        el.hide();

        thumbnail.hide = el.hide;

        return {
            container: el,
            thumbnail: thumbnail
        };
    },

    /**
    * Create thumbnail DOM fn
    * @param  {String} order prev/current/next
    * @return {DOM}    DOM element
    */
    createThumbnail(order) {
        var el = document.createElement('div');

        el.className = this.getThumbnailClassName(order);

        el.setImage = function (imageSrc) {
            if (imageSrc) {
                el.parentElement.show();
                onImageLoad(el, imageSrc, false);
            } else {
                this.parentElement.hide();
            }
        };

        return el;
    },

    // css class names generators:
    getSlideClassName(order) {
        return `cool-slider__slide cool-slider__${order}`;
    },

    getDescriptionClassName() {
        return `cool-slider__description`;
    },

    getThumbnailContainerClassName(order) {
        return `cool-slider__container-thumbnail cool-slider__container-thumbnail__${order}`;
    },

    getThumbnailClassName(order) {
        return `cool-slider__thumbnail cool-slider__thumbnail__${order}`;
    }
};

export {SliderBuilder};
