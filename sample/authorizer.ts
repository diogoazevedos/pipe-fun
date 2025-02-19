import {middleware} from '../main.js';
import type {Request} from './http.js';

export type Claim = {
	email: string;
};

export type Authorized = {
	claim: Claim;
};

type Authorizer = {
	verify(token: string): Claim;
};

type AuthorizerDependency = {
	secret: string;
};

export function createAuthorizer({secret}: AuthorizerDependency): Authorizer {
	function verify(token: string) {
		if (token !== secret) {
			throw new Error('Invalid token');
		}

		return {email: 'john@smith.me'};
	}

	return {verify};
}

export function withAuthorization(authorizer: Authorizer) {
	return middleware(({headers: {authorization}}: Pick<Request, 'headers'>) => {
		const claim = authorizer.verify(authorization);

		return {claim};
	});
}
