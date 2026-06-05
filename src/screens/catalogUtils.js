export const formatLabel = (value) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (text) => text.toUpperCase());

export const findCategoryNode = (tree, categorySlug) =>
  tree.find((entry) => entry.slug === categorySlug);

export const findSubcategoryNode = (tree, categorySlug, subcategorySlug) =>
  findCategoryNode(tree, categorySlug)?.subcategories.find(
    (entry) => entry.slug === subcategorySlug
  );
