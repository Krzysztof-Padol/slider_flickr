import {Slider} from './slider/Slider';

global.addSlider = function (e) {
    var searchText = document.getElementById("searchText").value;
    var proxy = document.getElementById("proxyInput").checked;
    var rootEl = document.querySelector('#widget-container');
    var newSlider;
    var config;

    config = {
        backgroundSize: 'contain', // There is also possibility to use 'cover' property
        slidesPerRequest: 15,
        searchText: searchText,
        intervalTime: 5000
    };

    if (proxy) {
        config.host = 'http://localhost:3001/search';
    }

    newSlider = new Slider(rootEl, config);

    return;
};