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
    // Live PayPal links on this site are fixed-price for a single piece.
    // Quantity is not sent to PayPal, so buyable items stay at qty 1.
    if (isBuyable(product)) qty = 1;
    var items = getCart();
    var found = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        if (isBuyable(product)) {
          showToast(product.name + " is already in your cart (limited to 1)");
          return;
        }
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
    var product = findProduct(id);
    // Fixed-price PayPal links charge one unit, so do not allow qty > 1
    // on items that actually check out.
    if (isBuyable(product) && qty >= 1) qty = 1;
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

  function normalizeCart() {
    var items = getCart();
    var changed = false;
    items.forEach(function (item) {
      var product = findProduct(item.id);
      if (isBuyable(product) && Number(item.qty) > 1) {
        item.qty = 1;
        changed = true;
      }
    });
    if (changed) setCart(items);
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
    var payableSubtotal = 0;
    var exampleSubtotal = 0;
    var payableItems = [];
    var exampleCount = 0;
    var unpricedCount = 0;

    items.forEach(function (item) {
      var product = findProduct(item.id);
      if (!product) return;
      var qty = Number(item.qty);
      if (isBuyable(product) && qty > 1) qty = 1;
      var buyable = isBuyable(product);
      var isExample = !!(
        product.placeholder &&
        !product.messageForPrice &&
        typeof product.price === "number"
      );
      var lineTotal = null;
      if (buyable) {
        lineTotal = product.price * qty;
        payableSubtotal += lineTotal;
        payableItems.push(product);
      } else if (isExample) {
        lineTotal = product.price * qty;
        exampleSubtotal += lineTotal;
        exampleCount += 1;
      } else {
        unpricedCount += 1;
      }

      var buyAction = buyable
        ? '<a class="btn primary small" href="' + escapeHtml(product.paypalLink) + '" target="_blank" rel="noopener noreferrer">Buy Now</a>'
        : '<a class="btn small" href="' + CONTACT_HREF + '">Coming soon / contact us</a>';

      var qtyControls;
      if (buyable) {
        qtyControls =
          '<div class="qty">' +
            '<span>Qty: 1 <span class="price-note">Unique piece — PayPal charges one item</span></span>' +
          "</div>";
      } else {
        qtyControls =
          '<div class="qty">' +
            '<button type="button" data-qty-delta="-1" data-id="' + escapeHtml(product.id) + '" aria-label="Decrease quantity">−</button>' +
            '<input type="number" min="1" value="' + qty + '" data-qty-input="' + escapeHtml(product.id) + '" aria-label="Quantity">' +
            '<button type="button" data-qty-delta="1" data-id="' + escapeHtml(product.id) + '" aria-label="Increase quantity">+</button>' +
          "</div>";
      }

      lines.push(
        '<article class="cart-item" data-cart-item="' + escapeHtml(product.id) + '">' +
          '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
          "<div>" +
            "<h3>" + escapeHtml(product.name) + "</h3>" +
            '<div class="meta">' + formatPrice(product) + (isExample ? " · Example price (not payable)" : "") + (buyable ? " · Live PayPal checkout" : "") + "</div>" +
            qtyControls +
            '<div class="cart-item-actions">' +
              buyAction +
              '<button type="button" class="btn ghost small" data-remove="' + escapeHtml(product.id) + '">Remove</button>' +
            "</div>" +
          "</div>" +
          '<div class="line-total">' + (lineTotal == null ? "—" : formatMoney(lineTotal)) + (isExample ? '<span class="price-note">Example</span>' : "") + "</div>" +
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
      "<p>There is no combined cart checkout. Each live PayPal button charges only that one item, at the official price. " +
      "Example prices are display-only and cannot be paid on this site. Use Coming soon / contact us, Whatnot, or TikTok for those pieces.</p>";

    if (exampleCount) {
      checkoutNote +=
        "<p>" +
        exampleCount +
        " item" + (exampleCount === 1 ? " has" : "s have") +
        " an example price and " + (exampleCount === 1 ? "is" : "are") +
        " not included in Payable now.</p>";
    }

    if (unpricedCount) {
      checkoutNote +=
        "<p>" +
        unpricedCount +
        " item" + (unpricedCount === 1 ? " needs" : "s need") +
        " a quoted price before purchase.</p>";
    }

    if (!payableItems.length && items.length) {
      checkoutNote += "<p>None of the items in your cart have a live PayPal checkout link.</p>";
    }

    var payableButtons = payableItems.map(function (product) {
      return (
        '<a class="btn primary" href="' +
        escapeHtml(product.paypalLink) +
        '" target="_blank" rel="noopener noreferrer">Pay ' +
        formatMoney(product.price) +
        " for " +
        escapeHtml(product.name) +
        "</a>"
      );
    }).join("");

    summaryEl.innerHTML =
      "<h2>Order summary</h2>" +
      '<div class="summary-row"><span>Items</span><span>' + cartCount() + "</span></div>" +
      '<div class="summary-row total"><span>Payable now</span><span>' + (payableItems.length ? formatMoney(payableSubtotal) : "—") + "</span></div>" +
      (exampleCount
        ? '<div class="summary-row"><span>Example prices (not charged)</span><span>' + formatMoney(exampleSubtotal) + "</span></div>"
        : "") +
      '<div class="notice" style="margin-top:18px">' + checkoutNote + "</div>" +
      '<div class="cta-row">' +
        payableButtons +
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
    normalizeCart();
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
    normalizeCart: normalizeCart,
    cartCount: cartCount,
    findProduct: findProduct,
    isBuyable: isBuyable,
    formatPrice: formatPrice,
    renderProductContainers: renderProductContainers,
    renderCartPage: renderCartPage
  };
})();
