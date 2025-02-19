import {middleware} from '../../main.js';
import type {Authorized} from '../authorizer.js';
import type {User} from './schema.js';
import type {UserService} from './service.js';

export type Logged = {
	user: User;
};

export function makeWithUser(userService: UserService) {
	return middleware(async ({claim}: Authorized) => {
		const user = await userService.getByUserEmail(claim.email);

		return {user};
	});
}

export function notifyUserLogin({user}: Logged) {
	console.log(`${user.email} logged in`);
}
