declare module '*.png';
declare module '*.jpg';

declare module 'mongodb'
{
  // this is required for importing types from the server
  // any ObjectId on the server will be just a string on the client
  export type ObjectId = string;
}
