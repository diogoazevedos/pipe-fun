import type {User} from './schema.ts';

const users = new Map<string, User>();

export type UserRepository = {
	create(user: User): Promise<void>;
	getAll(): Promise<User[]>;
};

export function makeUserRepository(): UserRepository {
	async function create(user: User) {
		users.set(user.id, user);
	}

	async function getAll() {
		return [...users.values()];
	}

	return {create, getAll};
}
