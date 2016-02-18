import {MicroAjax} from '../MicroAjax/microAjax';

var API_KEY = '6437e920f7debd7ab4439a0cc0914f73';
// TODO: get API_KEY and API URL from config
var FLICKR_API_URL = 'https://api.flickr.com/services/rest/';

var DAY_MILISECONDS = 1000 * 3600 * 24;
/**
 * Round date to date for a flicker max date
 * @param  {Date}   timeStamp date to round
 * @return {Date}   timestamp
 */
function roundDate(timeStamp){
    timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
    timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
    return new Date(timeStamp);
}

/**
 * Round date to date for a flicker max date as a timestamp
 * @return {Date}   timestamp
 */
function getLastDayTimestamp() {
    var now = new Date();

    return roundDate(now.getTime() - DAY_MILISECONDS).getTime() / 1000;
}

/**
 * Function preparing url for Flickr GET
 * @param  {String} options.searchText: searchText    searching text
 * @param  {String} options.apiKey:     apiKey        useless description
 * @param  {Number} options.perPage:    perPage       elements per page
 * @param  {Number} options.page:       page          page
 * @return {String}                     URL suited for Flickr API
 */
function prepareUrl({
    searchText: searchText,
    apiKey: apiKey,
    perPage: perPage,
    page: page,
    host: host
}) {
    var maxDate = getLastDayTimestamp();

    return host 
        + `?method=flickr.photos.search&text=${searchText}&max_upload_date=${maxDate}&page=${page}&per_page=${perPage}&api_key=${apiKey}&format=json&nojsoncallback=1`;
}

/**
 * Makin
 * @param  {String} searchText       searching text
 * @param  {Number} slidesPerRequest Slides per request
 * @param  {Number} page             page number
 * @return {Promise}                 Promise for get request
 */
function getImagesFromFlickr(searchText, slidesPerRequest, host, page = 1) {
    return new Promise((resolve, reject) => {
        new MicroAjax(prepareUrl({
            searchText: searchText,
            apiKey: API_KEY,
            perPage: slidesPerRequest,
            page: page,
            host: host
        }), resolve, reject);
    });
}

/**
 * Class taking care about fetching data from external source
 */
class SliderResource {
    constructor(config = {}, searchText) {
        this.searchText = searchText;
        this.slidesPerRequest = config.slidesPerRequest || 15;
        this.host = config.host || FLICKR_API_URL;
        this.page = 0;
        this.totalPages = 0;
        this.totalSlides = 0;
        this.photos = [];
        this.loading = false;

        this.onLoadDeferred = false;
    }

    /**
    * Function fetching images from api for certain page number
    * @param  {Number} page  useless description
    * @return {Promise}      Promise on loading next part of images
    */
    getImages(page = 1) {
        var self = this;

        this.onLoadDeferred = new Promise((resolve, reject) => {
            self.loading = true;

            getImagesFromFlickr(self.searchText, self.slidesPerRequest, self.host, page)
                .then((res) => {
                    var photos = res.photos;

                    self.loading = false;

                    self.page = photos.page;
                    self.totalPages = photos.pages;
                    self.totalSlides = photos.total / 1;
                    self.photos = self.photos.concat(photos.photo);

                    resolve(self);
                }, reject);
        });

        return this.onLoadDeferred;
    }

    /**
    * Expose function for geting image object previously fetched by API
    * @param  {Number} index index of certain image
    * @return {Object} object with images info
    */
    getImage(index) {
        // If that is almost last image what we have loaded... fetch next part from API
        if (this.photos.length <= index + 1 && this.photos.length !== this.totalSlides) {
            if (!this.loading) {
                this.getImages(this.page + 1);
            }
        }

        return this.photos[index];
    }

    /**
    * Return promise on load
    * @return {Promise}
    */
    onLoad() {
        return this.onLoadDeferred;
    }
}

export {SliderResource};

