import {middleware} from '../../main.ts';
import type {Authorized} from '../authorizer.ts';
import type {User} from './schema.ts';
import type {UserService} from './service.ts';

export type Logged = {
	user: User;
};

export function makeWithUser(userService: UserService) {
	return middleware(async ({claim}: Authorized) => {
		const user = await userService.getByEmail(claim.email);

		return {user};
	});
}

export function notifyUserLogin({user}: Logged) {
	console.log(`${user.email} logged in`);
}
