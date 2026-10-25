export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns a slug that does not collide with an existing record.
 * `Model` must expose `exists({ slug })`.
 */
export async function uniqueSlug(Model, text, ignoreId = null) {
  const base = slugify(text) || `item-${Date.now()}`;
  let candidate = base;
  let counter = 2;

  /* eslint-disable no-await-in-loop */
  while (true) {
    const query = { slug: candidate };
    if (ignoreId) query._id = { $ne: ignoreId };
    const exists = await Model.exists(query);
    if (!exists) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

/**
 * Keeps a slug unique while editing: only regenerates when the source text changed.
 */
export async function slugForUpdate(Model, text, id) {
  const doc = await Model.findById(id).select('slug title');
  if (doc && slugify(doc.title) === slugify(text)) return doc.slug;
  return uniqueSlug(Model, text, id);
}
