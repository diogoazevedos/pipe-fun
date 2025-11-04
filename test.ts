import test from 'node:test';
import assert from 'node:assert/strict';
import {
	_, assign, middleware, parallel, passthrough, pipe,
} from './main.ts';

const getUser = async () => ({name: 'John Smith'});
const addAge = middleware(async () => ({age: 30}));
const addHobby = middleware(() => ({hobby: 'Coding'}));
const addScore = middleware(() => ({score: 1000}));

void test('should transform data in a pipeline', async () => {
	const pipeline = pipe(addAge, addHobby, addScore);

	const result = await pipeline(await getUser());

	assert.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

void test('should transform data in a standalone pipeline', async () => {
	const pipeline = pipe(getUser, addAge, addHobby, addScore);

	const result = await pipeline(_);

	assert.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

void test('should transform data in a compound pipeline', async () => {
	const pipeline = pipe(addAge, pipe(addHobby, addScore));

	const result = await pipeline(await getUser());

	assert.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

void test('should transform data in a  compound standalone pipeline', async () => {
	const pipeline = pipe(getUser, pipe(addAge, addHobby), addScore);

	const result = await pipeline(_);

	assert.deepEqual(result, {
		name: 'John Smith', age: 30, hobby: 'Coding', score: 1000,
	});
});

void test('should transform data in parallel', async () => {
	const pipeline = parallel(addAge, getUser);

	const result = await pipeline({name: 'Jane Smith'});

	assert.deepEqual(result, [{name: 'Jane Smith', age: 30}, {name: 'John Smith'}]);
});

void test('should transform data in a parallel pipeline', async () => {
	const pipeline = pipe(getUser, parallel(addAge, addHobby));

	const result = await pipeline(_);

	assert.deepEqual(result, [
		{name: 'John Smith', age: 30},
		{name: 'John Smith', hobby: 'Coding'},
	]);
});

void test('should transform data in a compound parallel pipeline', async () => {
	const addAgeAndHobby = pipe(addAge, addHobby);

	const pipeline = pipe(getUser, parallel(addAgeAndHobby, addAgeAndHobby));

	const result = await pipeline(_);

	assert.deepEqual(result, [
		{name: 'John Smith', hobby: 'Coding', age: 30},
		{name: 'John Smith', hobby: 'Coding', age: 30},
	]);
});

void test('should assign the return of parallel', async () => {
	const pipeline = assign(parallel(addAge, addHobby));

	const result = await pipeline({name: 'John Smith'});

	assert.deepEqual(result, {name: 'John Smith', age: 30, hobby: 'Coding'});
});

void test('should passthought the transformed data', async () => {
	let captured;
	const pipeline = passthrough(input => {
		captured = input;
	});

	const result = await pipeline({name: 'John Smith'});

	assert.deepEqual(captured, {name: 'John Smith'});
	assert.deepEqual(result, {name: 'John Smith'});
});
