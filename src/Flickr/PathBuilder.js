var PathBuilder = {
    thumbnail: (farmId, serverId, id, secret) => {
        return `https:\/\/farm${farmId}.staticflickr.com\/${serverId}\/${id}_${secret}_q.jpg`;
    },
    small: (farmId, serverId, id, secret) => {
        return `https:\/\/farm${farmId}.staticflickr.com\/${serverId}\/${id}_${secret}_n.jpg`;
    },
    medium: (farmId, serverId, id, secret) => {
        return `https:\/\/farm${farmId}.staticflickr.com\/${serverId}\/${id}_${secret}_c.jpg`;
    },
    large: (farmId, serverId, id, secret) => {
        return `https:\/\/farm${farmId}.staticflickr.com\/${serverId}\/${id}_${secret}_h.jpg`;
    }
};

export {PathBuilder};
