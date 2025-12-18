export interface DecodedToken {
  [key: string]: unknown;
  uid: string;
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

export interface ApiUserToken {
  jti: string;
  aud: string;
  exp?: number;
  iat: number;
  iss: string;
  sub: string;
}

export interface AuthenticatedUser {
  uid: string;
  token: DecodedToken;
}
