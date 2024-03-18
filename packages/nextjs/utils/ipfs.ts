export const ipfsToHttps = (ipfsHash: string) => `https://ipfs.io/ipfs/${ipfsHash.split("//")[1]}`;
