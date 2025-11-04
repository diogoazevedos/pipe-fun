import {
	assign, parallel, passthrough, pipe,
} from '../../main.ts';
import {createAuthorizer, withAuthorization} from '../authorizer.ts';
import {makeTaskRepository} from '../task/repository.ts';
import {makeTaskService} from '../task/service.ts';
import {makeUserRepository} from '../user/repository.ts';
import {makeUserService} from '../user/service.ts';
import {withValidation} from '../validator.ts';
import {makeWithUser, notifyUserLogin} from '../user/middleware.ts';
import {makeCreateTask, notifyTaskCreation} from '../task/middleware.ts';
import type {Request} from '../http.ts';

const authorizer = createAuthorizer({secret: 'youshallnotpass'});

const taskRepository = makeTaskRepository();
const taskService = makeTaskService({taskRepository});

const userRepository = makeUserRepository();
const userService = makeUserService({userRepository});

export const pipeline = pipe(
	withValidation<Request>(/* Input Schema */),
	withAuthorization(authorizer),
	makeWithUser(userService),
	assign(parallel(makeCreateTask(taskService), notifyUserLogin)),
	passthrough(notifyTaskCreation),
);
