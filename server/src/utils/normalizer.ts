export let normalizeUrl: typeof import('normalize-url').default;


// This is a workaround to deal with esm/commonjs modules mess.
// normalize-url starting with v.7 doesn't work with commonjs
// while typerORM doesn't support esm.
// And on top of that, TypeScript automatically converts dynamic imports into require 
// and breaks normalize-url again. xD
export async function importNormalizer() {
  if (!normalizeUrl) {
    normalizeUrl = (
      await (eval('import("normalize-url")') as Promise<typeof import('normalize-url')>)
    ).default;
  }
}
