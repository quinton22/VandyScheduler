type HtmlElementCacheItem<T extends HTMLElement | HTMLCollection> = {
  element?: T;
  refresh: () => T | undefined;
};

type HtmlElementCache = {
  [key: string]: HtmlElementCacheItem<HTMLElement | HTMLCollection>;
};

class ElementCache {
  private cache: HtmlElementCache = {};

  public refresh<T extends HTMLElement | HTMLCollection>(
    key: string,
    backupRefresh?: () => T
  ) {
    if (!(key in this.cache)) return;

    const { refresh } = this.cache[key];
    const r = (refresh() && (refresh as () => T)) ?? backupRefresh;

    return r && this.set(key, r);
  }

  public has(key: string): boolean {
    return key in this.cache && !!this.cache[key].element;
  }

  private existsInDom<T extends HTMLElement | HTMLCollection>(element?: T) {
    return (
      !!element &&
      (element instanceof HTMLElement
        ? document.body.contains(element)
        : Array.from(element).every((e) => document.body.contains(e)))
    );
  }

  public exists(key: string) {
    if (!(key in this.cache)) return false;
    const { element } = this.cache[key];
    return this.existsInDom(element);
  }

  public get(key: string): HTMLElement | HTMLCollection;
  public get<T extends HTMLElement | HTMLCollection>(
    key: string,
    refresh: () => T
  ): T;
  public get<T extends HTMLElement | HTMLCollection>(
    key: string,
    refresh?: () => T
  ) {
    let el;
    if (this.has(key) && this.existsInDom((el = this.cache[key].element))) {
      return el;
    }

    return this.refresh(key, refresh);
  }

  public set<T extends HTMLElement | HTMLCollection>(
    key: string,
    refresh: () => T | null
  ) {
    const r = () => {
      try {
        return refresh() || undefined;
      } catch {}
    };

    const element = r();

    if (!this.existsInDom(element)) return;

    this.cache[key] = {
      element,
      refresh: r,
    };

    return element;
  }

  public delete(key: string) {
    key in this.cache && delete this.cache[key];
  }
  public clear(key?: string) {
    if (key) {
      this.delete(key);
    } else {
      this.cache = {};
    }
  }
}

export const elementCache = new ElementCache();
