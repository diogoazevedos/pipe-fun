import {middleware} from '../../main.js';
import type {Request} from '../http.js';
import type {Logged} from '../user/middleware.js';
import type {Task} from './schema.js';
import type {TaskService} from './service.js';

type WithTask = {
	task: Task;
};

export function makeCreateTask(taskService: TaskService) {
	return middleware(async ({user, body}: Logged & Pick<Request, 'body'>) => {
		const task = await taskService.create(body, user.id);

		return {task};
	});
}

export function notifyTaskCreation({task}: WithTask) {
	console.log(`${task.description} created`);
}
