import { EllipsisPipe } from './ellipsis.pipe';

describe('Pipe: EllipsisPipe', () => {
    let pipe;

    beforeEach(() => {
        pipe = new EllipsisPipe();
    });

    it('does work with an empty string', () => {
        expect(pipe.transform('')).toEqual('');
    });

    it('does not truncate text under the limit', () => {
        const text = 'Short text.';
        const result = pipe.transform(text, text.length + 1);
        expect(result).toEqual(text);
    });

    it('does truncate text over the limit', () => {
        const text = 'This is an example of long text.';
        const result = pipe.transform(text, 12);
        expect(result.length).toEqual(15);
    });

    it('does truncate text over the limit, with extra string', () => {
        const text = 'Short text.';
        const extra = 'Extra.';
        const result = pipe.transform(text, 15, extra);
        expect(result.length).toEqual(18 - extra.length);
    });

    it('does truncate text over the limit, with oversized extra string', () => {
        const text = 'Short text.';
        const extra = 'This is an example of long text.';
        const result = pipe.transform(text, 15, extra);
        expect(result).toEqual('...');
    });
});
