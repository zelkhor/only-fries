// ==UserScript==
// @name         Only fries JSON injector
// @namespace    https://app.fritzy.be
// @version      1.1
// @description  Permet la commande de frites à la friterie de la gare en injectant une commande sous format JSON
// @author       Toi
// @match        https://app.fritzy.be/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const placeId = 'b5ce1d14-b4b4-493c-846b-eaab8a464240';

    const createBags = () => {
        const newCart = {
            value: [
                {
                    id: placeId,
                    items: [],
                },
            ],
        };
        localStorage.setItem('bags', JSON.stringify(newCart));
    };

    const getCurrentCart = () => {
        const cartRaw = localStorage.getItem('bags');
        if (!cartRaw) return null;

        try {
            const cart = JSON.parse(cartRaw);
            return cart?.value?.[0] || null;
        } catch (e) {
            console.warn('Erreur parsing panier :', e);
            return null;
        }
    };

    const isCartEmpty = () => {
        const cart = getCurrentCart();
        if (!cart) return true;

        const items = cart.items || [];
        return !Array.isArray(items) || items.length === 0;
    };

    const getJsonOrderFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const encodedOrder = params.get('json_order');
        if (!encodedOrder) return null;

        try {
            return JSON.parse(decodeURIComponent(encodedOrder));
        } catch (e) {
            return console.error(
                '❌ Erreur de parsing de la commande JSON dans l’URL :',
                e
            );
        }
    };

    const askForOrder = () => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.width = '300px';
        container.style.padding = '10px';
        container.style.backgroundColor = '#fff';
        container.style.border = '2px solid #222';
        container.style.borderRadius = '8px';
        container.style.zIndex = 9999;
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        container.style.fontFamily = 'sans-serif';

        container.innerHTML = `
          <strong>📝 Injecter votre commande !</strong><br/>
          <textarea id="fritzy-json-input" rows="8" style="width: 100%; font-size: 12px;"></textarea>
          <button id="fritzy-inject-btn" style="margin-top: 8px; width: 100%; padding: 6px; background: #0f62fe; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Valider
          </button>
        `;

        document.body.appendChild(container);

        document
            .getElementById('fritzy-inject-btn')
            .addEventListener('click', () => {
                const input =
                    document.getElementById('fritzy-json-input').value;

                try {
                    const parsedOrder = JSON.parse(input);
                    const success = injectOrder(parsedOrder);

                    if (!success)
                        return alert(
                            '❌ La commande n’a pas pu être injectée. Vérifiez le format.'
                        );

                    container.remove();
                    setTimeout(() => {
                        location.reload();
                    }, 500);
                } catch (e) {
                    console.error(e);
                }
            });
    };

    const injectOrder = (order) => {
        if (!Array.isArray(order)) {
            alert('❌ La commande doit être un tableau d’items.');
            return false;
        }

        const currentCartRaw = localStorage.getItem('bags');
        const cart = JSON.parse(currentCartRaw);
        if (!cart?.value?.[0]) {
            alert('❌ Structure du panier invalide.');
            return false;
        }
        cart.value[0].items = order;
        localStorage.setItem('bags', JSON.stringify(cart));
        return true;
    };

    if (!getCurrentCart()) createBags();
    const orderFromUrl = getJsonOrderFromUrl();
    if (orderFromUrl) injectOrder(orderFromUrl);
    if (isCartEmpty()) askForOrder();
})();
