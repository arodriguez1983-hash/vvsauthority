(function () {
  "use strict";

  var CART_KEY = "vvs-authority-cart";
  var WHATNOT_URL = "https://www.whatnot.com/user/vvs_authority";
  var CONTACT_HREF = "contact.html";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) return [];
      return items.filter(function (item) {
        return item && item.id && Number(item.qty) > 0;
      });
    } catch (err) {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
  }

  function cartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + Number(item.qty || 0);
    }, 0);
  }

  function updateCartCount() {
    var count = cartCount();
    $all("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count);
    });
  }

  function findProduct(id) {
    if (typeof PRODUCTS === "undefined") return null;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function isBuyable(product) {
    return !!(
      product &&
      !product.placeholder &&
      product.paypalLink &&
      product.paypalLink !== "#"
    );
  }

  function formatPrice(product) {
    if (!product || product.messageForPrice || product.price == null || product.price === "") {
      return "Message for price";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(product.price);
  }

  function formatMoney(amount) {
    if (amount == null || isNaN(amount)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function addToCart(id, qty) {
    qty = Number(qty || 1);
    if (qty < 1) return;
    var product = findProduct(id);
    if (!product) return;
    var items = getCart();
    var found = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items[i].qty = Number(items[i].qty) + qty;
        found = true;
        break;
      }
    }
    if (!found) items.push({ id: id, qty: qty });
    setCart(items);
    showToast(product.name + " added to cart");
    if ($("[data-cart-page]")) renderCartPage();
  }

  function setQty(id, qty) {
    qty = Number(qty);
    var items = getCart();
    if (qty < 1) {
      items = items.filter(function (item) { return item.id !== id; });
    } else {
      items.forEach(function (item) {
        if (item.id === id) item.qty = qty;
      });
    }
    setCart(items);
    if ($("[data-cart-page]")) renderCartPage();
  }

  function removeFromCart(id) {
    setCart(getCart().filter(function (item) { return item.id !== id; }));
    if ($("[data-cart-page]")) renderCartPage();
  }

  function clearCart() {
    setCart([]);
    if ($("[data-cart-page]")) renderCartPage();
  }

  function buyNow(product) {
    if (isBuyable(product)) {
      window.open(product.paypalLink, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = CONTACT_HREF;
  }

  function buyNowButton(product) {
    if (isBuyable(product)) {
      return (
        '<a class="btn primary small" href="' +
        escapeHtml(product.paypalLink) +
        '" target="_blank" rel="noopener noreferrer" data-buy-now="' +
        escapeHtml(product.id) +
        '">Buy Now</a>'
      );
    }
    return (
      '<a class="btn small" href="' +
      CONTACT_HREF +
      '" data-buy-now="' +
      escapeHtml(product.id) +
      '">Coming soon / contact us</a>'
    );
  }

  function productCardHTML(product) {
    var priceNote = "";
    if (product.placeholder && !product.messageForPrice) {
      priceNote = '<span class="price-note">Example price</span>';
    }

    return (
      '<article class="product" data-product-id="' + escapeHtml(product.id) + '">' +
        '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
        "<div>" +
          '<span class="tag">' + escapeHtml(categoryLabel(product.category)) + "</span>" +
          "<h3>" + escapeHtml(product.name) + "</h3>" +
          "<p>" + escapeHtml(product.description) + "</p>" +
          '<p class="price">' + formatPrice(product) + priceNote + "</p>" +
          '<div class="product-actions">' +
            '<button type="button" class="btn small" data-add-to-cart="' + escapeHtml(product.id) + '">Add to Cart</button>' +
            buyNowButton(product) +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function categoryLabel(cat) {
    var map = {
      diamonds: "Lab Diamond",
      moissanite: "Moissanite",
      gemstones: "Gemstone",
      jewelry: "Jewelry"
    };
    return map[cat] || cat || "Featured";
  }

  function renderProductContainers() {
    if (typeof PRODUCTS === "undefined") return;
    $all("[data-category]").forEach(function (container) {
      var cat = container.getAttribute("data-category");
      var list;
      if (cat === "featured") {
        list = PRODUCTS.filter(function (p) { return p.featured; });
      } else if (cat) {
        list = PRODUCTS.filter(function (p) { return p.category === cat; });
      } else {
        list = PRODUCTS.slice();
      }
      if (!list.length) {
        container.innerHTML = '<p class="empty-cart">No pieces are listed in this collection yet. Message us on Whatnot for current inventory.</p>';
        return;
      }
      container.innerHTML = list.map(productCardHTML).join("");
    });
  }

  function renderCartPage() {
    var root = $("[data-cart-page]");
    if (!root) return;

    var listEl = $("[data-cart-list]", root);
    var summaryEl = $("[data-cart-summary]", root);
    var items = getCart();
    var lines = [];
    var subtotal = 0;
    var pricedCount = 0;
    var unpricedCount = 0;

    items.forEach(function (item) {
      var product = findProduct(item.id);
      if (!product) return;
      var qty = Number(item.qty);
      var hasPrice = !product.messageForPrice && typeof product.price === "number";
      var lineTotal = hasPrice ? product.price * qty : null;
      if (hasPrice) {
        subtotal += lineTotal;
        pricedCount += 1;
      } else {
        unpricedCount += 1;
      }

      var buyAction = isBuyable(product)
        ? '<a class="btn primary small" href="' + escapeHtml(product.paypalLink) + '" target="_blank" rel="noopener noreferrer">Buy Now</a>'
        : '<a class="btn small" href="' + CONTACT_HREF + '">Coming soon / contact us</a>';

      lines.push(
        '<article class="cart-item" data-cart-item="' + escapeHtml(product.id) + '">' +
          '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
          "<div>" +
            "<h3>" + escapeHtml(product.name) + "</h3>" +
            '<div class="meta">' + formatPrice(product) + (product.placeholder && !product.messageForPrice ? " · Example price" : "") + "</div>" +
            '<div class="qty">' +
              '<button type="button" data-qty-delta="-1" data-id="' + escapeHtml(product.id) + '" aria-label="Decrease quantity">−</button>' +
              '<input type="number" min="1" value="' + qty + '" data-qty-input="' + escapeHtml(product.id) + '" aria-label="Quantity">' +
              '<button type="button" data-qty-delta="1" data-id="' + escapeHtml(product.id) + '" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<div class="cart-item-actions">' +
              buyAction +
              '<button type="button" class="btn ghost small" data-remove="' + escapeHtml(product.id) + '">Remove</button>' +
            "</div>" +
          "</div>" +
          '<div class="line-total">' + (lineTotal == null ? "—" : formatMoney(lineTotal)) + "</div>" +
        "</article>"
      );
    });

    if (!lines.length) {
      listEl.innerHTML =
        '<div class="notice center empty-cart">' +
          "<h2>Your cart is empty</h2>" +
          "<p>Browse the collections and add pieces you love.</p>" +
          '<div class="cta-row" style="justify-content:center">' +
            '<a class="btn primary" href="diamonds.html">Shop diamonds</a>' +
            '<a class="btn" href="index.html">Back to home</a>' +
          "</div>" +
        "</div>";
      summaryEl.innerHTML = "";
      summaryEl.hidden = true;
      return;
    }

    listEl.innerHTML = lines.join("");
    summaryEl.hidden = false;

    var checkoutNote =
      "<p>Checkout is handled with individual PayPal links. Use Buy Now on each item that has a live payment link. " +
      "Items without a PayPal link are not available for checkout yet — contact us on Whatnot, TikTok, or the contact page.</p>";

    if (unpricedCount) {
      checkoutNote +=
        "<p>The subtotal only includes items with a listed price. " +
        unpricedCount +
        " item" + (unpricedCount === 1 ? "" : "s") +
        " " + (unpricedCount === 1 ? "needs" : "need") +
        " a quoted price before purchase.</p>";
    }

    if (!pricedCount && items.length) {
      checkoutNote += "<p>None of the items in your cart have a listed checkout price yet.</p>";
    }

    summaryEl.innerHTML =
      "<h2>Order summary</h2>" +
      '<div class="summary-row"><span>Items</span><span>' + cartCount() + "</span></div>" +
      '<div class="summary-row total"><span>Subtotal</span><span>' + (pricedCount ? formatMoney(subtotal) : "—") + "</span></div>" +
      '<div class="notice" style="margin-top:18px">' + checkoutNote + "</div>" +
      '<div class="cta-row">' +
        '<a class="btn" href="' + CONTACT_HREF + '">Contact us</a>' +
        '<a class="btn" href="' + WHATNOT_URL + '" target="_blank" rel="noopener noreferrer">Message on Whatnot</a>' +
      "</div>";
  }

  function showToast(message) {
    var el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function onClick(event) {
    var addBtn = event.target.closest("[data-add-to-cart]");
    if (addBtn) {
      event.preventDefault();
      addToCart(addBtn.getAttribute("data-add-to-cart"), 1);
      return;
    }

    var removeBtn = event.target.closest("[data-remove]");
    if (removeBtn) {
      event.preventDefault();
      removeFromCart(removeBtn.getAttribute("data-remove"));
      return;
    }

    var qtyBtn = event.target.closest("[data-qty-delta]");
    if (qtyBtn) {
      event.preventDefault();
      var id = qtyBtn.getAttribute("data-id");
      var delta = Number(qtyBtn.getAttribute("data-qty-delta"));
      var current = getCart().filter(function (item) { return item.id === id; })[0];
      var next = (current ? Number(current.qty) : 0) + delta;
      setQty(id, next);
      return;
    }

    var buyLink = event.target.closest("[data-buy-now]");
    if (buyLink) {
      var product = findProduct(buyLink.getAttribute("data-buy-now"));
      if (product && !isBuyable(product)) {
        // Let the contact.html href navigate normally.
        return;
      }
    }
  }

  function onChange(event) {
    var input = event.target.closest("[data-qty-input]");
    if (!input) return;
    var qty = Math.max(1, parseInt(input.value, 10) || 1);
    setQty(input.getAttribute("data-qty-input"), qty);
  }

  function initNav() {
    $all(".menu").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var links = $(".links");
        if (!links) return;
        var open = links.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    $all("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = (form.elements.namedItem("name") || {}).value || "";
      var email = (form.elements.namedItem("email") || {}).value || "";
      var message = (form.elements.namedItem("message") || {}).value || "";
      var subject = "VVS Authority inquiry from " + (name || "website visitor");
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        message;
      // Placeholder mailbox — replace when a public inbox is confirmed.
      var mailto = "mailto:contact@vvsauthority.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
      window.location.href = mailto;
    });
  }

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    if ($("[data-clear-cart]")) {
      clearCart();
    }
    updateCartCount();
    renderProductContainers();
    renderCartPage();
    initContactForm();
  });

  // Expose a small API for tests.
  window.VVS = {
    getCart: getCart,
    setCart: setCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    setQty: setQty,
    cartCount: cartCount,
    findProduct: findProduct,
    isBuyable: isBuyable,
    formatPrice: formatPrice,
    renderProductContainers: renderProductContainers,
    renderCartPage: renderCartPage
  };
})();
