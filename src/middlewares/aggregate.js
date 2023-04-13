const cron = require('node-cron');
const axios = require('axios');

cron.schedule('*/5 * * * *', () => {
  console.log('running a task every five minutes');
  try {
    const res = axios.get(`/aggregate`);
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
});
