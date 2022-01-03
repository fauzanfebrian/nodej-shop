const deleteProduct = async (btn) => {
  const id = btn.parentNode.querySelector("[name=id").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf").value;

  const productParent = document.querySelector("main .grid");
  const productElement = btn.closest("article");

  fetch(`/admin/product/${id}`, {
    method: "DELETE",
    headers: { "csrf-token": csrf },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message !== "product deleted")
        return showMessage(data.message, "error");
      showMessage(data.message);
      productElement.remove();
      if (!productParent.firstElementChild)
        productParent.parentNode.innerHTML = "<h1>No product found</h1>";
    })
    .catch(console.error);
};
