import axios from "../api/axios";
import Cookies from 'js-cookies';

const refresh = (refreshToken) => {
    console.log("Refreshing token!");
    return new Promise((resolve, reject) => {
        axios.post('/auth/token',
            JSON.stringify({ token: refreshToken }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(res => {
            if (res.data.success === false) {
                resolve(false);
            } else {
                let x = res.data
                Cookies.setItem('accessToken', x.accessToken);
                resolve(x.accessToken);
            }
        });
    });
};

export default refresh;