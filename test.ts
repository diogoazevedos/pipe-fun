import test from 'ava';
import {
	_, assign, middleware, parallel, passthrough, pipe,
} from './main.js';

const getUser = async () => ({name: 'John Smith'});
const addAge = middleware(async () => ({age: 30}));
const addHobby = middleware(() => ({hobby: 'Coding'}));
const addScore = middleware(() => ({score: 1000}));

test('should transform data in a pipeline', async t => {
	const pipeline = pipe(addAge, addHobby, addScore);

	const result = await pipeline(await getUser());

	t.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

test('should transform data in a standalone pipeline', async t => {
	const pipeline = pipe(getUser, addAge, addHobby, addScore);

	const result = await pipeline(_);

	t.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

test('should transform data in a compound pipeline', async t => {
	const pipeline = pipe(addAge, pipe(addHobby, addScore));

	const result = await pipeline(await getUser());

	t.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

test('should transform data in a  compound standalone pipeline', async t => {
	const pipeline = pipe(getUser, pipe(addAge, addHobby), addScore);

	const result = await pipeline(_);

	t.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

test('should transform data in parallel', async t => {
	const pipeline = parallel(addAge, getUser);

	const result = await pipeline({name: 'Jane Smith'});

	t.deepEqual(result, [{name: 'Jane Smith', age: 30}, {name: 'John Smith'}]);
});

test('should transform data in a parallel pipeline', async t => {
	const pipeline = pipe(getUser, parallel(addAge, addHobby));

	const result = await pipeline(_);

	t.deepEqual(result, [
		{name: 'John Smith', age: 30},
		{name: 'John Smith', hobby: 'Coding'},
	]);
});

test('should transform data in a compound parallel pipeline', async t => {
	const addAgeAndHobby = pipe(addAge, addHobby);

	const pipeline = pipe(getUser, parallel(addAgeAndHobby, addAgeAndHobby));

	const result = await pipeline(_);

	t.deepEqual(result, [
		{name: 'John Smith', hobby: 'Coding', age: 30},
		{name: 'John Smith', hobby: 'Coding', age: 30},
	]);
});

test('should assign the return of parallel', async t => {
	const pipeline = assign(parallel(addAge, addHobby));

	const result = await pipeline({name: 'John Smith'});

	t.deepEqual(result, {name: 'John Smith', age: 30, hobby: 'Coding'});
});

test('should passthought the transformed data', async t => {
	const pipeline = passthrough(() => t.pass());

	const result = await pipeline({name: 'John Smith'});

	t.deepEqual(result, {name: 'John Smith'});
	t.plan(2);
});
