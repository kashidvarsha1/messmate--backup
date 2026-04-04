import axios from '../api/axios';

export const getProviderById = async (id) => {
  const response = await axios.get('/providers/' + id);
  return response.data.data;
};

export const getProviders = async (params) => {
  const response = await axios.get('/providers', { params });
  return response.data.data;
};

export const providerIdMap = {};
export const getProviderByPublicId = async (publicId) => {
  const response = await axios.get('/providers/' + publicId);
  return response.data.data;
};