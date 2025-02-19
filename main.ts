type Awaitable<T> = T | Promise<T>;
export type Pipe<Output, Input> = (input: Input) => Awaitable<Output>;
export type Step<Output, T> = <Input extends T>(input: Input) => Awaitable<Output>;

/**
 * Special step that assign the input and output.
 *
 * @example
 * ```
 * const addHobby = middleware(() => ({hobby: 'Coding'}));
 *
 * await addHobby({name: 'John Smith'});
 * //=> {name: 'John Smith', hobby: 'Coding'}
 * ```
 */
export function middleware<Output, T>(step: Pipe<Output, T>) {
	return async <Input extends T>(input: Input) => ({...input, ...(await step(input))});
}

/**
 * Compose multiple steps.
 *
 * @example
 * ```
 * const getUser = async () => ({name: 'John Smith'});
 * const addHobby = middleware(() => ({hobby: 'Coding'}));
 *
 * const pipeline = pipe(getUser, addHobby);
 *
 * await pipeline();
 * //=> {name: 'John Smith', hobby: 'Coding'}
 * ```
 */
export function pipe<Output, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<Output, A>
): Pipe<Output, Input>;
export function pipe<Output, B, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<B, A>,
	s3: Pipe<Output, B>
): Pipe<Output, Input>;
export function pipe<Output, C, B, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<B, A>,
	s3: Pipe<C, B>,
	s4: Pipe<Output, C>
): Pipe<Output, Input>;
export function pipe<Output, D, C, B, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<B, A>,
	s3: Pipe<C, B>,
	s4: Pipe<D, C>,
	s5: Pipe<Output, D>
): Pipe<Output, Input>;
export function pipe<Output, E, D, C, B, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<B, A>,
	s3: Pipe<C, B>,
	s4: Pipe<D, C>,
	s5: Pipe<E, D>,
	s6: Pipe<Output, E>
): Pipe<Output, Input>;
export function pipe<Output, F, E, D, C, B, A, Input>(
	s1: Pipe<A, Input>,
	s2: Pipe<B, A>,
	s3: Pipe<C, B>,
	s4: Pipe<D, C>,
	s5: Pipe<E, D>,
	s6: Pipe<F, E>,
	s7: Pipe<Output, F>
): Pipe<Output, Input>;
export function pipe<Input>(
	init: Pipe<unknown, Input>,
	...steps: Array<Pipe<unknown, unknown>>
): Pipe<unknown, Input> {
	// eslint-disable-next-line unicorn/no-array-reduce
	return input => steps.reduce(async (promise, step) => step(await promise), init(input));
}

/**
 * Execute steps in parallel.
 *
 * @example
 * ```
 * const getUser = async () => ({name: 'John Smith'});
 * const getSession = async () => ({id: '4a53'});
 *
 * const pipeline = parallel(getUser, getSession);
 *
 * await pipeline();
 * //=> [{name: 'John Smith'}, {id: '4a53'}]
 * ```
 */
export function parallel<D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>
): Pipe<[B, D], A & C>;
export function parallel<F, E, D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>,
	s3: Pipe<F, E>
): Pipe<[B, D, F], A & C & E>;
export function parallel<H, G, F, E, D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>,
	s3: Pipe<F, E>,
	s4: Pipe<H, G>
): Pipe<[B, D, F, H], A & C & E & G>;
export function parallel<J, I, H, G, F, E, D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>,
	s3: Pipe<F, E>,
	s4: Pipe<H, G>,
	s5: Pipe<J, I>
): Pipe<[B, D, F, H, J], A & C & E & G & I>;
export function parallel<L, K, J, I, H, G, F, E, D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>,
	s3: Pipe<F, E>,
	s4: Pipe<H, G>,
	s5: Pipe<J, I>,
	s6: Pipe<L, K>
): Pipe<[B, D, F, H, J, L], A & C & E & G & I & K>;
export function parallel<N, M, L, K, J, I, H, G, F, E, D, C, B, A>(
	s1: Pipe<B, A>,
	s2: Pipe<D, C>,
	s3: Pipe<F, E>,
	s4: Pipe<H, G>,
	s5: Pipe<J, I>,
	s6: Pipe<L, K>,
	s7: Pipe<N, M>
): Pipe<[B, D, F, H, J, L, N], A & C & E & G & I & K & M>;
export function parallel<Input>(...steps: Array<Pipe<unknown, Input>>): Pipe<unknown[], Input> {
	return async input => Promise.all(steps.map(step => step(input)));
}

type Assign<T extends unknown[]> = T extends [infer Head, ...infer Tail]
	? Head & Assign<Tail>
	: unknown;

/**
 * Assign the output of a parallel step.
 *
 * @example
 * ```
 * const getUser = async () => ({name: 'John Smith'});
 * const addHobby = middleware(() => ({hobby: 'Coding'}));
 *
 * const pipeline = assign(parallel(getUser, addHobby));
 *
 * await pipeline();
 * //=> {name: 'John Smith', hobby: 'Coding'}
 * ```
 */
export function assign<Output extends unknown[], Input>(
	step: Step<Output, Input>,
): Pipe<Assign<Output>, Input> {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return async input => Object.assign({}, ...(await step(input)));
}

/**
 * Special step that passthrough the input.
 *
 * @example
 * ```
 * type User = {name: string};
 *
 * const notifyLogin = (user: User) => console.log(`User ${user.name} logged in`);
 *
 * const pipeline = passthrough(notifyLogin);
 *
 * await pipeline({name: 'John Smith'});
 * //=> {name: 'John Smith'}
 * ```
 */
export function passthrough<T>(step: Pipe<unknown, T>) {
	// eslint-disable-next-line no-sequences
	return async <Input extends T>(input: Input) => (await step(input), input);
}

/**
 * Placeholder for step without input.
 *
 * @example
 * ```
 * const pipeline = pipe(() => ({name: 'John Smith'}), user => user.name);
 *
 * await pipeline(_);
 * //=> 'John Smith'
 * ```
 */
export const _ = {};
