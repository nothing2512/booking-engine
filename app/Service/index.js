const axios = require('axios')

const axiosInstance = axios.create({
    baseURL: 'https://api-dot-ngajilagi.et.r.appspot.com/api/v1'
})

module.exports = {axios: axiosInstance}