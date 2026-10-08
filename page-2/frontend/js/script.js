/**
 * 50ml Luxury Store - Unica AJ PDP Interactive Script
 * Strictly implements review & critique specifications:
 * 1. Collapsed sidebar with Lorem Ipsum navigation items
 * 2. Interactive star rating form (1-5 stars) without review count or stock info
 * 3. Capacity variation without subtotal/total box on PDP
 * 4. Quantity capsule, Add to Cart, Love Wishlist & Accordions
 * 5. Cart Sidebar Modal (Right Drawer Minicart) with item list, quantities, subtotal, and checkout
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. COLLAPSED SIDEBAR (Navigation Drawer - Left)
  // =========================================================================
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const collapsedSidebar = document.getElementById('collapsed-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    closeCart(); // Tutup cart drawer jika sedang terbuka
    if (collapsedSidebar && sidebarOverlay) {
      collapsedSidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.classList.add('sidebar-open');
    }
  };

  const closeSidebar = () => {
    if (collapsedSidebar && sidebarOverlay) {
      collapsedSidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  };

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // =========================================================================
  // 2. CART SIDEBAR MODAL (Minicart Drawer - Right)
  // =========================================================================
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const btnCart = document.getElementById('btn-cart');
  const cartBadge = document.getElementById('cart-count-badge');
  const cartSidebarCount = document.getElementById('cart-sidebar-items-count');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyView = document.getElementById('cart-empty-view');
  const cartSubtotalVal = document.getElementById('cart-subtotal-val');
  const btnCheckout = document.getElementById('btn-checkout');
  const btnContinueLink = document.getElementById('btn-continue-link');
  const btnStartShopping = document.getElementById('btn-start-shopping');
  const thresholdText = document.getElementById('threshold-text');
  const thresholdProgressFill = document.getElementById('threshold-progress-fill');

  // Cart State (Dikelola di front-end)
  let cartItems = [];

  const openCart = () => {
    closeSidebar(); // Tutup menu drawer kiri jika sedang terbuka
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.classList.add('cart-open');
      cartSidebar.setAttribute('aria-hidden', 'false');
    }
  };

  const closeCart = () => {
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.remove('open');
      cartOverlay.classList.remove('active');
      document.body.classList.remove('cart-open');
      cartSidebar.setAttribute('aria-hidden', 'true');
    }
  };

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (btnContinueLink) cartCloseBtn && btnContinueLink.addEventListener('click', closeCart);
  if (btnStartShopping) btnStartShopping.addEventListener('click', closeCart);
  if (btnCart) {
    btnCart.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }

  // Keyboard accessibility: ESC closes both sidebars
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
      closeCart();
    }
  });

  // Render list produk & subtotal dalam modal sidebar
  const renderCart = () => {
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    // 1. Badge pada Header
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    // 2. Count pada Title Sidebar
    if (cartSidebarCount) {
      cartSidebarCount.textContent = `(${totalCount})`;
    }

    // 3. Subtotal Belanja
    if (cartSubtotalVal) {
      cartSubtotalVal.textContent = `$${subtotal.toFixed(2)}`;
    }

    // 4. Free Delivery Threshold ($150 target)
    const thresholdLimit = 150.0;
    if (thresholdText && thresholdProgressFill) {
      if (subtotal >= thresholdLimit) {
        thresholdText.innerHTML = '🎉 You unlocked <strong>Free Delivery</strong>!';
        thresholdProgressFill.style.width = '100%';
      } else {
        const remaining = (thresholdLimit - subtotal).toFixed(2);
        const percent = Math.min(100, Math.round((subtotal / thresholdLimit) * 100));
        thresholdText.innerHTML = `Free delivery from $150. Add <strong id="threshold-remaining">$${remaining}</strong> more!`;
        thresholdProgressFill.style.width = `${percent}%`;
      }
    }

    // 5. Render Konten Body (Empty state vs List)
    if (cartItems.length === 0) {
      if (cartEmptyView) cartEmptyView.classList.add('active');
      if (cartItemsList) cartItemsList.innerHTML = '';
      if (btnCheckout) {
        btnCheckout.disabled = true;
        btnCheckout.style.opacity = '0.5';
        btnCheckout.style.cursor = 'not-allowed';
      }
    } else {
      if (cartEmptyView) cartEmptyView.classList.remove('active');
      if (btnCheckout) {
        btnCheckout.disabled = false;
        btnCheckout.style.opacity = '1';
        btnCheckout.style.cursor = 'pointer';
      }

      if (cartItemsList) {
        cartItemsList.innerHTML = cartItems.map((item) => `
          <li class="cart-item-card" data-id="${item.id}">
            <div class="cart-item-img-link">
              <img 
                src="${item.img}" 
                alt="${item.brand} ${item.title} ${item.size}" 
                onerror="this.src='img/unica.jpeg'"
              >
            </div>
            <div class="cart-item-content">
              <div class="cart-item-top">
                <div class="cart-item-headings">
                  <span class="cart-item-brand">${item.brand}</span>
                  <h3 class="cart-item-title">${item.title}</h3>
                  <span class="cart-item-variant">Size: <strong>${item.size}</strong></span>
                  <span class="cart-item-price-unit">$${item.unitPrice.toFixed(2)} each</span>
                </div>
                <button 
                  type="button" 
                  class="cart-item-remove-btn" 
                  data-id="${item.id}" 
                  aria-label="Remove ${item.title} ${item.size}" 
                  title="Remove item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div class="cart-item-bottom">
                <div class="cart-qty-capsule">
                  <button type="button" class="cart-qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                  <span class="cart-qty-val" aria-label="Quantity ${item.quantity}">${item.quantity}</span>
                  <button type="button" class="cart-qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <span class="cart-item-line-total">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </li>
        `).join('');
      }
    }
  };

  // Event delegation untuk tombol di dalam cart list (qty +, qty -, remove)
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const minusBtn = e.target.closest('.cart-qty-minus');
      const plusBtn = e.target.closest('.cart-qty-plus');
      const removeBtn = e.target.closest('.cart-item-remove-btn');

      if (minusBtn) {
        const id = minusBtn.getAttribute('data-id');
        const item = cartItems.find((it) => it.id === id);
        if (item) {
          if (item.quantity > 1) {
            item.quantity -= 1;
          } else {
            // Jika tinggal 1 lalu dikurangi, hapus item dari cart
            cartItems = cartItems.filter((it) => it.id !== id);
          }
          renderCart();
        }
      } else if (plusBtn) {
        const id = plusBtn.getAttribute('data-id');
        const item = cartItems.find((it) => it.id === id);
        if (item) {
          item.quantity += 1;
          renderCart();
        }
      } else if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        cartItems = cartItems.filter((it) => it.id !== id);
        renderCart();
        showToast('Item removed from your shopping bag.');
      }
    });
  }

  // Checkout button simulation
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      showToast(`Proceeding to checkout with ${totalCount} item(s)...`);
    });
  }

  // Initialize cart state
  renderCart();

  // =========================================================================
  // 3. INTERACTIVE STAR RATING FORM (1 to 5 Stars)
  // =========================================================================
  const starButtons = document.querySelectorAll('.star-btn');
  let selectedRating = 5; // Default 5 stars as on 50ml

  const renderStars = (ratingToDisplay) => {
    starButtons.forEach((btn) => {
      const starVal = parseInt(btn.getAttribute('data-rating'), 10);
      if (starVal <= ratingToDisplay) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  starButtons.forEach((btn) => {
    const starVal = parseInt(btn.getAttribute('data-rating'), 10);

    // Hover effect to preview rating
    btn.addEventListener('mouseenter', () => {
      if (btn.disabled || !productData) return;
      starButtons.forEach((b) => {
        const val = parseInt(b.getAttribute('data-rating'), 10);
        if (val <= starVal) {
          b.classList.add('hover-preview');
        } else {
          b.classList.remove('hover-preview');
        }
      });
    });

    // Mouse leave restores selected rating
    btn.addEventListener('mouseleave', () => {
      if (btn.disabled || !productData) return;
      starButtons.forEach((b) => b.classList.remove('hover-preview'));
      renderStars(selectedRating);
    });

    // Click to confirm rating
    btn.addEventListener('click', () => {
      if (btn.disabled || !productData) return;
      selectedRating = starVal;
      starButtons.forEach((b) => {
        const val = parseInt(b.getAttribute('data-rating'), 10);
        b.setAttribute('aria-checked', val === selectedRating ? 'true' : 'false');
      });
      renderStars(selectedRating);
      showToast(`Thank you! You rated ${selectedRating} of 5 stars.`);
    });
  });

  // Initialize stars
  renderStars(selectedRating);

  // =========================================================================
  // 4. BACKEND API INTEGRATION (PRODUCT ID: 1)
  // =========================================================================
  const API_URL = 'http://localhost:3000/api/products/1';
  let productData = null;

  // DOM Elements untuk Detail Produk
  const productNameEl = document.getElementById('product-name');
  const productSubtitleEl = document.getElementById('product-subtitle');
  const brandTitleEl = document.getElementById('brand-title');
  const bcCurrentEl = document.getElementById('bc-current');
  const productPriceEl = document.getElementById('product-price');
  const mainProductImg = document.getElementById('main-product-img');
  const thumbsListEl = document.getElementById('thumbs-list');
  const swatchesContainer = document.getElementById('swatches-buttons-row');
  const selectedSizeLabel = document.getElementById('selected-size-label');
  const descPanelBody = document.getElementById('desc-inner-body');
  const infoPanelBody = document.getElementById('info-inner-body');
  const featuresTbody = document.getElementById('features-tbody');

  // DOM Elements untuk Action: Add to Cart & Quantity
  const btnAddToCart = document.getElementById('btn-add-to-cart');
  const btnCartText = document.getElementById('btn-cart-text');
  const btnMinus = document.getElementById('btn-minus');
  const btnPlus = document.getElementById('btn-plus');
  const quantityInput = document.getElementById('quantity-input');
  const btnWishlist = document.getElementById('btn-wishlist');
  let currentQty = 1;
  let isWishlisted = false;
  let selectedVariation = null; // Menyimpan variasi terpilih { size, price }

  // Event listener untuk tombol variasi/swatch yang di-render secara dinamis
  function attachSwatchListeners() {
    const currentSwatchButtons = document.querySelectorAll('.swatch-val-btn');
    currentSwatchButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled || !productData) return;

        currentSwatchButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');

        const size = btn.getAttribute('data-size');
        const rawPrice = parseFloat(btn.getAttribute('data-raw-price')) || 0;

        selectedVariation = {
          size: size,
          price: rawPrice
        };

        if (selectedSizeLabel && size) selectedSizeLabel.textContent = size;
        if (productPriceEl) productPriceEl.textContent = `$${rawPrice.toFixed(2)}`;
      });
    });
  }

  // Render data produk dari backend ke elemen DOM
  function renderProduct(prod) {
    if (!prod) return;
    productData = prod;

    // 1. Title, Breadcrumb & Brand
    document.title = `${prod.Name} | 50ml`;
    if (productNameEl) productNameEl.textContent = prod.Name;
    if (bcCurrentEl) bcCurrentEl.textContent = prod.Name;

    // Ambil Brand dari Features
    let brand = 'Innoxa';
    if (Array.isArray(prod.Features)) {
      const foundBrand = prod.Features.find((f) => f.label && f.label.toLowerCase() === 'brand');
      if (foundBrand) brand = foundBrand.value;
    } else if (prod.Features && prod.Features.Brand) {
      brand = prod.Features.Brand;
    }
    if (brandTitleEl) {
      brandTitleEl.textContent = brand;
      brandTitleEl.title = brand;
    }

    // Subtitle produk diambil dari Features atau kalimat pertama Description
    let subtitle = '';
    if (Array.isArray(prod.Features)) {
      const concern = prod.Features.find((f) => f.label && f.label.toLowerCase() === 'concern')?.value;
      const pType = prod.Features.find((f) => f.label && f.label.toLowerCase().includes('product type'))?.value;
      const skinType = prod.Features.find((f) => f.label && f.label.toLowerCase().includes('skin type'))?.value;
      if (concern && pType && skinType) {
        subtitle = `${concern.toLowerCase()} ${pType.toLowerCase()} for ${skinType.toLowerCase()} skin types`;
      }
    }
    if (!subtitle && prod.Description) {
      const commaSplit = prod.Description.split(',');
      subtitle = commaSplit.length > 1 ? commaSplit[1].split('.')[0].trim() : prod.Description.slice(0, 45);
    }
    if (productSubtitleEl) {
      productSubtitleEl.textContent = subtitle;
    }

    // 2. Gambar Utama & Thumbnails
    const photoSrc = prod.Photo 
      ? (prod.Photo.startsWith('http') || prod.Photo.startsWith('img/') ? prod.Photo : `img/${prod.Photo}`)
      : 'img/unica.jpeg';

    if (mainProductImg) {
      mainProductImg.src = photoSrc;
      mainProductImg.alt = `${brand} ${prod.Name}`;
    }

    if (thumbsListEl) {
      thumbsListEl.innerHTML = [1, 2, 3, 4].map((num, idx) => `
        <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" data-src="${photoSrc}" aria-label="Thumbnail ${num}">
          <img src="${photoSrc}" alt="Thumbnail ${num}" width="80" height="80">
        </button>
      `).join('');

      const newThumbBtns = thumbsListEl.querySelectorAll('.thumb-btn');
      newThumbBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          newThumbBtns.forEach((t) => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          const src = btn.getAttribute('data-src');
          if (mainProductImg && src) {
            mainProductImg.src = src;
          }
        });
      });
    }

    // 3. Render Variasi Ukuran & Harga secara Dinamis dari 'prod.Variation'
    // Variasi produk wajib dipilih antara 50 atau 100 ml, default awal adalah 50 ml.
    // Harga produk diperoleh langsung dari variasinya.
    if (swatchesContainer && Array.isArray(prod.Variation) && prod.Variation.length > 0) {
      // Cari variasi default 50 ml
      const defaultVar = prod.Variation.find((v) => {
        const s = typeof v === 'object' && v !== null ? v.size : String(v);
        return s && s.toLowerCase().includes('50');
      }) || prod.Variation[0];

      const defaultSize = typeof defaultVar === 'object' && defaultVar !== null ? defaultVar.size : String(defaultVar);
      const defaultPrice = typeof defaultVar === 'object' && defaultVar !== null ? Number(defaultVar.price) : 0;

      // Set variasi awal (default 50 ml)
      selectedVariation = {
        size: defaultSize,
        price: defaultPrice
      };

      swatchesContainer.innerHTML = prod.Variation.map((v) => {
        const isObj = typeof v === 'object' && v !== null;
        const size = isObj ? v.size : String(v);
        const priceNum = isObj ? Number(v.price) : 0;
        const isActive = size === defaultSize;

        return `
          <button 
            type="button" 
            class="swatch-val-btn ${isActive ? 'active' : ''}" 
            role="radio" 
            aria-checked="${isActive ? 'true' : 'false'}" 
            data-size="${size}" 
            data-price="$${priceNum.toFixed(2)}"
            data-raw-price="${priceNum}"
            id="swatch-${String(size).replace(/[^a-zA-Z0-9]/g, '')}"
          >
            ${size}
          </button>
        `;
      }).join('');

      // Tampilkan label kapasitas dan harga dari variasi yang aktif (default: 50 ml)
      if (selectedSizeLabel) selectedSizeLabel.textContent = defaultSize;
      if (productPriceEl) productPriceEl.textContent = `$${defaultPrice.toFixed(2)}`;

      // Pasang event listener ke swatch buttons baru
      attachSwatchListeners();
    } else {
      selectedVariation = null;
      if (selectedSizeLabel) selectedSizeLabel.textContent = '-';
      if (productPriceEl) productPriceEl.textContent = '-';
    }

    // 4. Accordion 1: Description (Diambil dari prod.Description)
    if (descPanelBody && prod.Description) {
      descPanelBody.innerHTML = `<p>${prod.Description}</p>`;
    }

    // 5. Accordion 2: More Information (Diambil dari prod['More Information'])
    const moreInfoText = prod['More Information'] || prod.moreInformation || prod.more_information;
    if (infoPanelBody && moreInfoText) {
      infoPanelBody.innerHTML = `<p>${moreInfoText}</p>`;
    }

    // 6. Accordion 3: Features (Diambil dari prod.Features)
    if (featuresTbody && prod.Features) {
      if (Array.isArray(prod.Features)) {
        featuresTbody.innerHTML = prod.Features.map((f, i) => `
          <tr class="${i % 2 === 0 ? 'row-highlight' : ''}">
            <th scope="row">${f.label}</th>
            <td>${f.value}</td>
          </tr>
        `).join('');
      } else if (typeof prod.Features === 'object') {
        featuresTbody.innerHTML = Object.entries(prod.Features).map(([label, val], i) => `
          <tr class="${i % 2 === 0 ? 'row-highlight' : ''}">
            <th scope="row">${label}</th>
            <td>${val}</td>
          </tr>
        `).join('');
      }
    }
  }

  // Fungsi untuk mematikan seluruh interaksi produk (Add to Cart, Wishlist, Bintang, Variasi) jika backend belum/gagal merespon
  function disableProductInteractions(btnMessage = 'Add to Cart') {
    // 1. Add to Cart & Quantity
    if (btnAddToCart) {
      btnAddToCart.disabled = true;
      btnAddToCart.style.opacity = '0.5';
      btnAddToCart.style.cursor = 'not-allowed';
      btnAddToCart.setAttribute('aria-disabled', 'true');
      if (btnCartText) btnCartText.textContent = btnMessage;
    }
    if (btnMinus) btnMinus.disabled = true;
    if (btnPlus) btnPlus.disabled = true;

    // 2. Wishlist Button (Hati)
    if (btnWishlist) {
      btnWishlist.disabled = true;
      btnWishlist.style.opacity = '0.5';
      btnWishlist.style.cursor = 'not-allowed';
      btnWishlist.setAttribute('aria-disabled', 'true');
    }

    // 3. Star Rating Buttons (Bintang 1-5)
    starButtons.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.setAttribute('aria-disabled', 'true');
    });

    // 4. Tombol Variasi Kapasitas (50 ml / 100 ml)
    const swatchBtns = document.querySelectorAll('.swatch-val-btn');
    swatchBtns.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.setAttribute('aria-disabled', 'true');
    });
  }

  // Fungsi untuk mengaktifkan kembali seluruh interaksi produk setelah respon sukses dari backend
  function enableProductInteractions() {
    // 1. Add to Cart & Quantity
    if (btnAddToCart) {
      btnAddToCart.disabled = false;
      btnAddToCart.style.opacity = '1';
      btnAddToCart.style.cursor = 'pointer';
      btnAddToCart.removeAttribute('aria-disabled');
      if (btnCartText) btnCartText.textContent = 'Add to Cart';
    }
    if (btnPlus) btnPlus.disabled = false;
    if (btnMinus) btnMinus.disabled = currentQty <= 1;

    // 2. Wishlist Button (Hati)
    if (btnWishlist) {
      btnWishlist.disabled = false;
      btnWishlist.style.opacity = '1';
      btnWishlist.style.cursor = 'pointer';
      btnWishlist.removeAttribute('aria-disabled');
    }

    // 3. Star Rating Buttons (Bintang 1-5)
    starButtons.forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.removeAttribute('aria-disabled');
    });

    // 4. Tombol Variasi Kapasitas (50 ml / 100 ml)
    const swatchBtns = document.querySelectorAll('.swatch-val-btn');
    swatchBtns.forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.removeAttribute('aria-disabled');
    });
  }

  // Panggil data produk ID 1 dari backend REST API
  async function fetchProductDetail() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        renderProduct(json.data);
        enableProductInteractions(); // Respon sukses: aktifkan Add to Cart, Wishlist, dan Bintang!
      } else {
        throw new Error('Respon backend tidak valid atau status bukan success');
      }
    } catch (err) {
      console.warn('Backend belum merespon atau terjadi error:', err);
      productData = null;
      disableProductInteractions('Add to Cart'); // Gagal / error: matikan Add to Cart, Wishlist, dan Bintang!

      // Auto-retry fetch setiap 2 detik
      setTimeout(fetchProductDetail, 2000);
    }
  }

  // Set awal: Seluruh interaksi produk dimatikan sampai respon valid dari backend diterima
  disableProductInteractions('Add to Cart');

  // Load data awal dari backend
  fetchProductDetail();

  // =========================================================================
  // 5. QUANTITY CONTROLLER (min. 1)
  // =========================================================================
  const updateQuantity = (newVal) => {
    currentQty = Math.max(1, newVal);
    if (quantityInput) quantityInput.value = currentQty;
    if (btnMinus) btnMinus.disabled = currentQty <= 1;
  };

  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      if (currentQty > 1) updateQuantity(currentQty - 1);
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      updateQuantity(currentQty + 1);
    });
  }

  // =========================================================================
  // 6. ADD TO CART & LOVE WISHLIST
  // =========================================================================
  // Add to Cart: Menambahkan item dinamis ke keranjang belanja
  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      // Proteksi tambahan: jika belum ada data produk valid atau tombol disabled, batalkan aksi
      if (!productData || !productData.id || btnAddToCart.disabled) {
        showToast('Produk belum berhasil dimuat dari server backend.');
        return;
      }
      // Variasi wajib dipilih antara 50 atau 100 ml
      if (!selectedVariation || !selectedVariation.size || selectedVariation.price === undefined) {
        showToast('Pilih salah satu variasi (50 ml atau 100 ml) terlebih dahulu.');
        return;
      }

      const activeSize = selectedVariation.size;
      const unitPrice = Number(selectedVariation.price);

      const prodId = productData ? productData.id : 1;
      const prodName = productData ? productData.Name : 'Unica AJ';
      let brandName = 'Innoxa';
      if (productData && Array.isArray(productData.Features)) {
        const b = productData.Features.find((f) => f.label && f.label.toLowerCase() === 'brand');
        if (b) brandName = b.value;
      } else if (productData && productData.Features && productData.Features.Brand) {
        brandName = productData.Features.Brand;
      }

      const photoSrc = productData && productData.Photo 
        ? (productData.Photo.startsWith('http') || productData.Photo.startsWith('img/') ? productData.Photo : `img/${productData.Photo}`)
        : 'img/unica.jpeg';

      const itemId = `prod-${prodId}-${activeSize.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;

      // Periksa apakah item varian ini sudah ada dalam cart
      const existingItem = cartItems.find((item) => item.id === itemId);
      if (existingItem) {
        existingItem.quantity += currentQty;
      } else {
        cartItems.push({
          id: itemId,
          brand: brandName,
          title: prodName,
          size: activeSize,
          unitPrice: unitPrice,
          quantity: currentQty,
          img: photoSrc
        });
      }

      // Visual button feedback
      const originalText = btnCartText ? btnCartText.textContent : 'Add to Cart';
      if (btnCartText) btnCartText.textContent = '✓ Added to Cart!';
      btnAddToCart.classList.add('feedback-added');

      setTimeout(() => {
        if (btnCartText) btnCartText.textContent = originalText;
        btnAddToCart.classList.remove('feedback-added');
      }, 1600);

      // Render cart items & buka modal sidebar keranjang
      renderCart();
      openCart();
      showToast(`${brandName} ${prodName} (${activeSize}) added to your shopping bag.`);
    });
  }

  // Love Wishlist
  if (btnWishlist) {
    btnWishlist.addEventListener('click', () => {
      // Proteksi tambahan: jika belum ada data produk valid atau tombol disabled, batalkan aksi
      if (!productData || !productData.id || btnWishlist.disabled) {
        showToast('Informasi produk belum berhasil dimuat dari backend.');
        return;
      }
      isWishlisted = !isWishlisted;
      if (isWishlisted) {
        btnWishlist.classList.add('active');
        btnWishlist.setAttribute('aria-label', 'Remove from Wishlist');
        btnWishlist.setAttribute('title', 'Remove from Wish List');
        showToast('Product has been added to your Wish List.', true);
      } else {
        btnWishlist.classList.remove('active');
        btnWishlist.setAttribute('aria-label', 'Add to Wishlist');
        btnWishlist.setAttribute('title', 'Add to Wish List');
        showToast('Product removed from your Wish List.');
      }
    });
  }

  // =========================================================================
  // 7. ACCORDION DROPDOWNS (Description, More information, Features)
  // =========================================================================
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const panelId = header.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        header.classList.remove('active');
        if (panel) panel.classList.remove('open');
      } else {
        header.setAttribute('aria-expanded', 'true');
        header.classList.add('active');
        if (panel) panel.classList.add('open');
      }
    });
  });


  // =========================================================================
  // 9. TOAST NOTIFICATION UTILITY
  // =========================================================================
  const siteToast = document.getElementById('site-toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastCheck = document.getElementById('toast-check');
  let toastTimeout = null;

  function showToast(message, isHeart = false) {
    if (!siteToast || !toastMsg) return;

    if (toastTimeout) clearTimeout(toastTimeout);

    toastMsg.textContent = message;
    if (toastCheck) {
      toastCheck.textContent = isHeart ? '♥' : '✓';
      toastCheck.style.color = isHeart ? '#904745' : '#10B981';
    }

    siteToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      siteToast.classList.remove('show');
    }, 2800);
  }
});
