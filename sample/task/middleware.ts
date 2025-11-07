import {middleware} from '../../main.ts';
import type {Request} from '../http.ts';
import type {Logged} from '../user/middleware.ts';
import type {Task} from './schema.ts';
import type {TaskService} from './service.ts';

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
