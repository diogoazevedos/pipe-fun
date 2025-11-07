import type {Task} from './schema.ts';

const tasks = new Map<string, Task>();

export type TaskRepository = {
	create(task: Task): Promise<void>;
	getAll(): Promise<Task[]>;
};

export function makeTaskRepository(): TaskRepository {
	async function create(task: Task) {
		tasks.set(task.id, task);
	}

	async function getAll() {
		return [...tasks.values()];
	}

	return {create, getAll};
}
