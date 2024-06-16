import { elementCache } from '../elementCache';

describe('elementCache', () => {
  const ID = 'my-div';
  beforeEach(() => {
    document.body.innerHTML = `<div id="${ID}"></div>`;
    elementCache.clear();
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should call refresh', () => {
      const refresh = jest.fn();
      elementCache.set('key', refresh);
      expect(refresh).toHaveBeenCalled();
    });

    it('should set the item in the cache properly', () => {
      const refresh = () => document.getElementById(ID);
      elementCache.set(ID, refresh);
      // @ts-expect-error
      expect(elementCache.cache).toEqual({
        [ID]: {
          element: refresh(),
          refresh: expect.any(Function),
        },
      });
    });
  });
  describe('get', () => {
    it('should call refresh if key does not exist or element is undefined', () => {
      const refreshSpy = jest.spyOn(elementCache, 'refresh');
      const refresh = jest.fn();
      elementCache.get(ID, refresh);

      expect(refreshSpy).toHaveBeenCalledWith(ID, refresh);
      expect(refresh).not.toHaveBeenCalled();

      elementCache.set(ID, () => null);
      elementCache.get(ID, refresh);
      expect(refreshSpy).toHaveBeenCalledWith(ID, refresh);
      // expect(refresh).toHaveBeenCalledTimes(1);
    });
    it('should call refresh if element is not in dom', () => {
      const refreshSpy = jest.spyOn(elementCache, 'refresh');
      elementCache.set(ID, () => document.getElementById(ID));

      document.body.innerHTML = '';

      elementCache.get(ID);

      expect(refreshSpy).toHaveBeenCalledWith(ID, undefined);
    });
    it('should return the value of the element if it is in the cache and exists in the dom', () => {
      elementCache.set(ID, () => document.getElementById(ID));
      expect(elementCache.get(ID)).toMatchInlineSnapshot(`
<div
  id="my-div"
/>
`);
    });
  });
  describe('refresh', () => {});
  describe('has', () => {
    it('should return true if the key is in the cache and the element is truthy', () => {
      expect(elementCache.has(ID)).toEqual(false);
      elementCache.set(ID, () => null);
      expect(elementCache.has(ID)).toEqual(false);
      elementCache.set(ID, () => document.getElementById(ID));

      document.body.innerHTML = '';

      expect(elementCache.has(ID)).toEqual(true);
    });
  });
  describe('exists', () => {
    it('should return false when has returns false', () => {
      expect(elementCache.exists(ID)).toEqual(false);
      elementCache.set(ID, () => null);
      expect(elementCache.exists(ID)).toEqual(false);
    });
    it('should return true if has returns true and it exists in the dom', () => {
      elementCache.set(ID, () => document.getElementById(ID));
      expect(elementCache.exists(ID)).toEqual(true);

      document.body.innerHTML = '';

      expect(elementCache.exists(ID)).toEqual(false);
    });
  });

  describe('delete', () => {
    it('should delete the keyn', () => {
      elementCache.set(ID, () => document.getElementById(ID));
      expect(elementCache.has(ID)).toEqual(true);

      elementCache.delete(ID);
      expect(elementCache.has(ID)).toEqual(false);
    });
  });

  describe('clear', () => {
    it('should delete the key if passed in', () => {
      elementCache.set(ID, () => document.getElementById(ID));
      expect(elementCache.has(ID)).toEqual(true);

      elementCache.clear(ID);
      expect(elementCache.has(ID)).toEqual(false);
    });
    it('should delete the whole cache', () => {
      elementCache.set(ID, () => document.getElementById(ID));
      expect(elementCache.has(ID)).toEqual(true);
      // @ts-expect-error
      expect(elementCache.cache).toMatchInlineSnapshot(`
{
  "my-div": {
    "element": <div
      id="my-div"
    />,
    "refresh": [Function],
  },
}
`);

      elementCache.clear();
      // @ts-expect-error
      expect(elementCache.cache).toEqual({});
    });
  });
});
