import {randomUUID} from 'node:crypto';
import type {TaskRepository} from './repository.js';
import type {Task} from './schema.js';

export type TaskService = {
	create(description: string, userId: string): Promise<Task>;
	getByUserId(userId: string): Promise<Task[]>;
};

type TaskServiceDependency = {
	taskRepository: TaskRepository;
};

export function makeTaskService({taskRepository}: TaskServiceDependency): TaskService {
	async function getByUserId(userId: string) {
		const tasks = await taskRepository.getAll();

		return tasks.filter(task => task.userId === userId);
	}

	async function create(description: string, userId: string) {
		const task: Task = {
			id: randomUUID(), description, userId, status: 'pending',
		};

		await taskRepository.create(task);

		return task;
	}

	return {create, getByUserId};
}
