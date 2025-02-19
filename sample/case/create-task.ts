import {
	assign, parallel, passthrough, pipe,
} from '../../main.js';
import {createAuthorizer, withAuthorization} from '../authorizer.js';
import {makeTaskRepository} from '../task/repository.js';
import {makeTaskService} from '../task/service.js';
import {makeUserRepository} from '../user/repository.js';
import {makeUserService} from '../user/service.js';
import {withValidation} from '../validator.js';
import {makeWithUser, notifyUserLogin} from '../user/middleware.js';
import {makeCreateTask, notifyTaskCreation} from '../task/middleware.js';
import type {Request} from '../http.js';

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
