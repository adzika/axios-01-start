import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://axios-96545.firebaseio.com'
});

instance.defaults.headers.common['WHATEVER'] = 'whatever';

export default instance