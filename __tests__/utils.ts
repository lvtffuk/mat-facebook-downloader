import { expect } from 'chai';
import { stringifyQueryString } from '../src/utils';

describe('Utils', () => {

	it('stringifies the query params object', () => {
		expect(stringifyQueryString({ foo: 'bar' })).to.be.equal('foo=bar');
		expect(stringifyQueryString({ foo: 'bar', bar: 'foo' })).to.be.equal('foo=bar&bar=foo');
		expect(stringifyQueryString({ foo: '' })).to.be.equal('foo=\'\'');
		expect(stringifyQueryString({ foo: null })).to.be.equal('');
		expect(stringifyQueryString({ foo: undefined })).to.be.equal('');
		expect(stringifyQueryString({})).to.be.equal('');
	});
});
