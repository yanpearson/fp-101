// Kestrel
const K = x => y => x;

describe('K (kestrel) combinator', () => {
	test('Always return a constant value', () => {
		const constant = K(42);
		expect(constant(1)).toBe(42);
		expect(constant('foo')).toBe(42);
	});
});

// Identity
const I = x => x;

describe('I (identity) combinator', () => {
	test('Always return itself', () => {
		const identity = I;
		expect(identity(42)).toBe(42);
		expect(identity('foo')).toBe('foo');
	});
});

// Vireo (pairing)
const V = x => y => z => z(x)(y);

describe('V (pairing) combinator', () => {
	test('Applies a function over a pair', () => {
		const pair = V(2)(40);
		const sum = x => y => x + y;
		expect(pair(sum)).toBe(42);
	});
});

// Combining combinators
describe('Combining the combinators', () => {
	test('When you combine the K and V combinators together you always return the left value of a pair', () => {
		const pair = V('the meaning of life')(42);
		expect(pair(K)).toBe('the meaning of life');
	});

	test('When you combine the K, I and V combinators together you always return the right value of a pair', () => {
		const pair = V('the meaning of life')(42);
		expect(pair(K(I))).toBe(42);
	});
});

// Linked list implementation
describe('With these combinators we can implement a linked list', () => {
	const list = V(1)(V(2)(V(3)(V(4)(V(5)(null)))));

	const value = K;
	const next = K(I);

	test('You can get the value of the first node by applying to the list the K combinator', () => {
		const firstNode = list;
		expect(firstNode(value)).toBe(1);
	});

	test('You can access the next node by applying to the list the K combinator combined with the I combinator', () => {
		const secondNode = list(next);
		expect(secondNode(value)).toBe(2);
	});

	test('You can access the third node like this', () => {
		const thirdNode = list(next)(next);
		expect(thirdNode(value)).toBe(3);
	});

	test('And so on...', () => {
		const fourthNode = list(next)(next)(next);
		expect(fourthNode(value)).toBe(4);

		const fifthNode = fourthNode(next);
		expect(fifthNode(value)).toBe(5);

		const endOfList = fifthNode(next);
		expect(endOfList).toBe(null);
	});
});

// User friendly way to create a linked list
describe('An easier way to create the linked list', () => {
	const list = (...elements) => {
		const [ head, ...tail ] = elements;
		if (head === undefined) return null;
		return V(head)(list(...tail));
	};

	test('Using a variadic function', () => {
		const l = list('a', 'b', 'c');
		expect(l(K)).toBe('a');
		expect(l(K(I))(K)).toBe('b');
		expect(l(K(I))(K(I))(K)).toBe('c');
	});
});

// Folding the linked list
describe('Folding a linked list', () => {
	const list = V(2)(V(4)(V(6)(V(8)(V(10)(null)))));

	const fold = (fn, acc) => current => next => {
		if (next === null) return fn(current, acc);
		return fold(fn, fn(current, acc))(next(K))(next(K(I)));
	};

	test('With fold now we can get the length of the list', () => {
		const length = fold((current, acc) => acc + 1, 0);
		const listLength = list(length);
		expect(listLength).toBe(5);
	});
});

// Map implementation
describe('Map over a linked list', () => {
	const list = V(2)(V(4)(V(6)(null)));

	const map = fn => current => next => {
		if (next == null) return V(fn(current))(null);
		return V(fn(current))(map(fn)(next(K))(next(K(I))));
	};

	test('We can double each item value', () => {
		const double = x => x * 2;
		const l = list(map(double));

		expect(l(K)).toBe(4);
		expect(l(K(I))(K)).toBe(8);
		expect(l(K(I))(K(I))(K)).toBe(12);
	});
});
