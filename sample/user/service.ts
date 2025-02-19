import {randomUUID} from 'node:crypto';
import type {User} from './schema.js';
import type {UserRepository} from './repository.js';

export type UserService = {
	create(name: string, email: string): Promise<void>;
	getByUserEmail(email: string): Promise<User>;
};

type UserServiceDependency = {
	userRepository: UserRepository;
};

export function makeUserService({userRepository}: UserServiceDependency): UserService {
	async function isRegistered(email: string) {
		const users = await userRepository.getAll();

		return users.some(user => user.email === email);
	}

	async function create(name: string, email: string) {
		if (await isRegistered(email)) {
			throw new Error('User already exists');
		}

		const user: User = {
			id: randomUUID(), name, email,
		};

		await userRepository.create(user);
	}

	async function getByUserEmail(email: string) {
		const users = await userRepository.getAll();

		const user = users.find(user => user.email === email);

		if (user) {
			return user;
		}

		throw new Error('User not found');
	}

	return {create, getByUserEmail};
}
