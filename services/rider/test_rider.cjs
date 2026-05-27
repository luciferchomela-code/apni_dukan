require('dotenv').config();
const axios = require('axios');
axios.put(process.env.SHOP_SERVICE + '/api/order/assign/rider', {
    orderId: '6a0ffd9127b4b313b87be339',
    riderId: '123',
    riderName: '123',
    riderPhone: '123'
}, {
    headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
}).then(r => console.log('Success:', r.data))
  .catch(e => console.log('Error:', e.response?.status, e.response?.data?.message || e.message));
