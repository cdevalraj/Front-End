import axios from "../api/axios";

const refresh = (refreshToken) => {
    return new Promise((resolve, reject) => {
        axios.post('/auth/token',
            JSON.stringify({ token: refreshToken }),
            {
                headers: {'Content-Type': 'application/json'}
            }
        ).then(res => {
            if (res.data.success === false) {
                resolve(false);
            } else {
                resolve(res.data);
            }
        }).catch((er)=>{
            console.log(er.message)
            reject(er.message)
        });
    });
};

export default refresh;