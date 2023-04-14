const axios = require("axios");
const BASE_URL = "https://dhpstagingapi.health.go.ke/";
const { generateToken } = require("../utils/auth");
const { CHT } = require("../../config");
const { idMap, generateClientRegistryPayload } = require("../utils/client");
const {logger} = require('../utils/logger');

const axiosInstance = axios.create({
  baseURL: `${process.env.CLIENT_REGISTRY_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const searchClientByIdType = async (echisClientDoc) => {
  try {
    const identificationType = getIdentificationType(
      echisClientDoc?.identifications?.identificationType
    );
    let clientNumber;
    logger.information("Calling client registry");
    const res = await axiosInstance.get(
      `partners/registry/search/${identificationType}/${echisClientDoc?.identifications?.identificationNumber}`
    );
    if (res.data.clientExists) {
      logger.information("Client found");
      clientNumber = res.data.client.clientNumber;
    } else { 
      logger.information("Client not found");
      logger.information("Creating client in client registry");
      const response = await createClientInRegistry(
        JSON.stringify(generateClientRegistryPayload(echisClientDoc))
      );
      clientNumber = response;
    }
    const echisDoc = await getEchisDocForUpdate(echisClientDoc.doc_id);
    const echisResponse = await updateEchisDocWithUpi(clientNumber, echisDoc);
    return echisResponse;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const getIdentificationType = (idType) => {
  if (idType in idMap) {
    return idMap[idType];
  }
  return idType;
};

const createClientInRegistry = async (client) => {
  const res = await axiosInstance.post(`partners/registry`, client);
  return res.data.clientNumber;
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await generateToken();
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

const echisAxiosInstance = axios.create({
  baseURL: "https://chis-staging.health.go.ke/",
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: CHT.username,
    password: CHT.password,
  },
});

const getEchisDocForUpdate = async (docId) => {
  const response = await echisAxiosInstance.get(`medic/${docId}`);
  return response.data;
};

const updateEchisDocWithUpi = async (clientUpi, echisDoc) => {
  logger.information("Updating eCHIS document with client registry UPI");
  echisDoc.upi = clientUpi;
  const response = await echisAxiosInstance.put(
    `medic/${echisDoc._id}`,
    JSON.stringify(echisDoc)
  );
  return response.data;
};

module.exports = {
  searchClientByIdType,
};

// const samplePayload = {
//   firstName: "Maina",
//   middleName: "And",
//   lastName: "Kingangi",
//   dateOfBirth: "2022-12-09",
//   maritalStatus: "single",
//   gender: "male",
//   occupation: "other",
//   religion: "christian",
//   educationLevel: "college",
//   country: "KE",
//   countyOfBirth: "042",
//   isAlive: true,
//   originFacilityKmflCode: "15828",
//   residence: {
//     county: "042",
//     subCounty: "kisumu-central",
//     ward: "kondele",
//     village: "kondele",
//     landMark: "kondele",
//     address: "kondele",
//   },
//   identifications: [
//     {
//       countryCode: "KE",
//       identificationType: "national-id",
//       identificationNumber: "ALPDD1232143434",
//     },
//   ],
//   contact: {
//     primaryPhone: "+254700111111",
//     secondaryPhone: "+254700111111",
//     emailAddress: "string@gmail.com",
//   },
//   nextOfKins: [
//     {
//       name: "Cresta Lindt",
//       relationship: "sibling",
//       residence: "kondele",
//       contact: {
//         primaryPhone: "+254700334567",
//       },
//     },
//   ],
// };

//illustration purposes
// const getIdInfoFromEchisPayload = (echisDoc) => {
//   return {
//     identificationType: echisDoc.id_type || "alien-id",
//     identificationNumber: echisDoc.id || "TESTZA12345",
//   };
// };
