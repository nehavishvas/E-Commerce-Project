import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { LoadingBox } from "../componenet/LoadingBox";
import { MassageBox } from "../componenet/MassageBox";

const emptyCategoryForm = {
  name: "",
  description: "",
  heroImage: "",
  gallery: "",
  highlights: "",
  facts: "",
  shopperNotes: "",
  sortOrder: 0,
  isActive: true,
};

const emptySubcategoryForm = {
  categoryId: "",
  name: "",
  description: "",
  heroImage: "",
  gallery: "",
  highlights: "",
  facts: "",
  shopperNotes: "",
  sortOrder: 0,
  isActive: true,
};

const emptyItemForm = {
  categoryId: "",
  subcategoryId: "",
  name: "",
  description: "",
  heroImage: "",
  gallery: "",
  highlights: "",
  sortOrder: 0,
  isActive: true,
};

const listToField = (list = []) => list.join(", ");

const payloadFromForm = (form) => ({
  ...form,
  sortOrder: Number(form.sortOrder) || 0,
  gallery: form.gallery,
  highlights: form.highlights,
  facts: form.facts,
  shopperNotes: form.shopperNotes,
});

const AdminCatalogScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [catalog, setCatalog] = useState({
    categories: [],
    subcategories: [],
    items: [],
  });
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userUpdatingId, setUserUpdatingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState(emptySubcategoryForm);
  const [itemForm, setItemForm] = useState(emptyItemForm);

  const loadAdminCatalog = async () => {
    setLoading(true);
    setError("");

    try {
      const [catalogResponse, usersResponse] = await Promise.all([
        api.get("/admin/catalog"),
        api.get("/admin/users"),
      ]);
      setCatalog(catalogResponse.data);
      setUsers(usersResponse.data.users || []);
      setAvailableRoles(usersResponse.data.availableRoles || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load admin catalog"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminCatalog();
  }, []);

  const activeSubcategories = useMemo(
    () =>
      catalog.subcategories.filter(
        (entry) => String(entry.categoryId) === String(itemForm.categoryId)
      ),
    [catalog.subcategories, itemForm.categoryId]
  );

  const handleSuccess = (message) => {
    setSuccess(message);
    setError("");
    loadAdminCatalog();
  };

  const categorySubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingCategoryId) {
        await api.put(
          `/admin/categories/${editingCategoryId}`,
          payloadFromForm(categoryForm)
        );
        handleSuccess("Category updated");
      } else {
        await api.post("/admin/categories", payloadFromForm(categoryForm));
        handleSuccess("Category created");
      }
      setEditingCategoryId(null);
      setCategoryForm(emptyCategoryForm);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const subcategorySubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingSubcategoryId) {
        await api.put(
          `/admin/subcategories/${editingSubcategoryId}`,
          payloadFromForm(subcategoryForm)
        );
        handleSuccess("Subcategory updated");
      } else {
        await api.post("/admin/subcategories", payloadFromForm(subcategoryForm));
        handleSuccess("Subcategory created");
      }
      setEditingSubcategoryId(null);
      setSubcategoryForm(emptySubcategoryForm);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const itemSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editingItemId) {
        await api.put(`/admin/items/${editingItemId}`, payloadFromForm(itemForm));
        handleSuccess("Item updated");
      } else {
        await api.post("/admin/items", payloadFromForm(itemForm));
        handleSuccess("Item created");
      }
      setEditingItemId(null);
      setItemForm(emptyItemForm);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const deleteEntity = async (type, id) => {
    try {
      await api.delete(`/admin/${type}/${id}`);
      handleSuccess(`${type.slice(0, -1)} deleted`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const updateUserAccess = async (userId, nextRole, nextActive) => {
    setUserUpdatingId(userId);
    try {
      await api.put(`/admin/users/${userId}`, {
        role: nextRole,
        isActive: nextActive,
      });
      handleSuccess("User access updated");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUserUpdatingId(null);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      heroImage: category.heroImage,
      gallery: listToField(category.gallery),
      highlights: listToField(category.highlights),
      facts: listToField(category.facts),
      shopperNotes: listToField(category.shopperNotes),
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
  };

  const startEditSubcategory = (subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryForm({
      categoryId: subcategory.categoryId,
      name: subcategory.name,
      description: subcategory.description,
      heroImage: subcategory.heroImage,
      gallery: listToField(subcategory.gallery),
      highlights: listToField(subcategory.highlights),
      facts: listToField(subcategory.facts),
      shopperNotes: listToField(subcategory.shopperNotes),
      sortOrder: subcategory.sortOrder,
      isActive: subcategory.isActive,
    });
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      name: item.name,
      description: item.description,
      heroImage: item.heroImage,
      gallery: listToField(item.gallery),
      highlights: listToField(item.highlights),
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  };

  return (
    <div className="page-shell admin-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="page-title">Catalog Management</h1>
          <p className="page-subtitle">
            Create and maintain categories, subcategories, and item groups from
            Mongo-backed data with admin authorization.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{catalog.categories.length}</strong>
            <span>categories</span>
          </div>
          <div className="hero-stat">
            <strong>{catalog.subcategories.length}</strong>
            <span>subcategories</span>
          </div>
          <div className="hero-stat">
            <strong>{catalog.items.length}</strong>
            <span>items</span>
          </div>
          <div className="hero-stat">
            <strong>{users.length}</strong>
            <span>users</span>
          </div>
        </div>
      </section>

      {loading ? <LoadingBox /> : null}
      {error ? <MassageBox variant="error">{error}</MassageBox> : null}
      {success ? <MassageBox variant="success">{success}</MassageBox> : null}

      <div className="admin-grid">
        <section className="admin-card">
          <h2>{editingCategoryId ? "Edit Category" : "Create Category"}</h2>
          <form onSubmit={categorySubmitHandler} className="admin-form">
            <input
              type="text"
              placeholder="Category name"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              required
            />
            <textarea
              rows="3"
              placeholder="Description"
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
            />
            <input
              type="url"
              placeholder="Hero image URL"
              value={categoryForm.heroImage}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, heroImage: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Gallery URLs comma separated"
              value={categoryForm.gallery}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, gallery: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Highlights comma separated"
              value={categoryForm.highlights}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  highlights: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Facts comma separated"
              value={categoryForm.facts}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, facts: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Shopper notes comma separated"
              value={categoryForm.shopperNotes}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  shopperNotes: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Sort order"
              value={categoryForm.sortOrder}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  sortOrder: e.target.value,
                })
              }
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    isActive: e.target.checked,
                  })
                }
              />
              Active
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="primary">
                {editingCategoryId ? "Update Category" : "Create Category"}
              </button>
              {editingCategoryId ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm(emptyCategoryForm);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          <div className="admin-list">
            {catalog.categories.map((category) => (
              <div key={category.id} className="admin-list-card">
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.slug}</span>
                </div>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEditCategory(category)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => deleteEntity("categories", category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2>{editingSubcategoryId ? "Edit Subcategory" : "Create Subcategory"}</h2>
          <form onSubmit={subcategorySubmitHandler} className="admin-form">
            <select
              value={subcategoryForm.categoryId}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  categoryId: e.target.value,
                })
              }
              required
            >
              <option value="">Select category</option>
              {catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Subcategory name"
              value={subcategoryForm.name}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  name: e.target.value,
                })
              }
              required
            />
            <textarea
              rows="3"
              placeholder="Description"
              value={subcategoryForm.description}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  description: e.target.value,
                })
              }
            />
            <input
              type="url"
              placeholder="Hero image URL"
              value={subcategoryForm.heroImage}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  heroImage: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Gallery URLs comma separated"
              value={subcategoryForm.gallery}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  gallery: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Highlights comma separated"
              value={subcategoryForm.highlights}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  highlights: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Facts comma separated"
              value={subcategoryForm.facts}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  facts: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Shopper notes comma separated"
              value={subcategoryForm.shopperNotes}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  shopperNotes: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Sort order"
              value={subcategoryForm.sortOrder}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  sortOrder: e.target.value,
                })
              }
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={subcategoryForm.isActive}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    isActive: e.target.checked,
                  })
                }
              />
              Active
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="primary">
                {editingSubcategoryId ? "Update Subcategory" : "Create Subcategory"}
              </button>
              {editingSubcategoryId ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingSubcategoryId(null);
                    setSubcategoryForm(emptySubcategoryForm);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          <div className="admin-list">
            {catalog.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="admin-list-card">
                <div>
                  <strong>{subcategory.name}</strong>
                  <span>
                    {subcategory.categoryName} / {subcategory.slug}
                  </span>
                </div>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEditSubcategory(subcategory)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => deleteEntity("subcategories", subcategory.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2>{editingItemId ? "Edit Item Group" : "Create Item Group"}</h2>
          <form onSubmit={itemSubmitHandler} className="admin-form">
            <select
              value={itemForm.categoryId}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  categoryId: e.target.value,
                  subcategoryId: "",
                })
              }
              required
            >
              <option value="">Select category</option>
              {catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={itemForm.subcategoryId}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  subcategoryId: e.target.value,
                })
              }
              required
            >
              <option value="">Select subcategory</option>
              {activeSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Item group name"
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({ ...itemForm, name: e.target.value })
              }
              required
            />
            <textarea
              rows="3"
              placeholder="Description"
              value={itemForm.description}
              onChange={(e) =>
                setItemForm({ ...itemForm, description: e.target.value })
              }
            />
            <input
              type="url"
              placeholder="Hero image URL"
              value={itemForm.heroImage}
              onChange={(e) =>
                setItemForm({ ...itemForm, heroImage: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Gallery URLs comma separated"
              value={itemForm.gallery}
              onChange={(e) =>
                setItemForm({ ...itemForm, gallery: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Highlights comma separated"
              value={itemForm.highlights}
              onChange={(e) =>
                setItemForm({ ...itemForm, highlights: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Sort order"
              value={itemForm.sortOrder}
              onChange={(e) =>
                setItemForm({ ...itemForm, sortOrder: e.target.value })
              }
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={itemForm.isActive}
                onChange={(e) =>
                  setItemForm({ ...itemForm, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="primary">
                {editingItemId ? "Update Item Group" : "Create Item Group"}
              </button>
              {editingItemId ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditingItemId(null);
                    setItemForm(emptyItemForm);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          <div className="admin-list">
            {catalog.items.map((item) => (
              <div key={item.id} className="admin-list-card">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.categoryName} / {item.subcategoryName}
                  </span>
                </div>
                <div className="admin-list-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEditItem(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => deleteEntity("items", item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2>User Roles</h2>
          <p className="page-subtitle compact">
            Admin manages users and catalog. Manager manages catalog only.
            Customer is shopper-only access.
          </p>
          <div className="admin-list">
            {users.map((user) => (
              <div key={user.id} className="admin-list-card admin-user-card">
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span>
                    Role: {user.role} · {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="admin-user-actions">
                  <select
                    value={user.role}
                    disabled={userUpdatingId === user.id}
                    onChange={(e) =>
                      updateUserAccess(
                        user.id,
                        e.target.value,
                        user.isActive
                      )
                    }
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={user.isActive}
                      disabled={userUpdatingId === user.id}
                      onChange={(e) =>
                        updateUserAccess(
                          user.id,
                          user.role,
                          e.target.checked
                        )
                      }
                    />
                    Active
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCatalogScreen;
