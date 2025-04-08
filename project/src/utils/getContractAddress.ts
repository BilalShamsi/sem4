import contractAddress from './contractAddress.json';

const getContractAddress = (): string => {
  return contractAddress.address; // or contractAddress.contractAddress based on your JSON
};

export default getContractAddress;
