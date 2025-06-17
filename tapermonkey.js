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

    const doesCartOrderAlreadyExists = () => {
        const cartRaw = localStorage.getItem('bags');
        if (!cartRaw) return false;

        try {
            const cart = JSON.parse(cartRaw);
            const items = cart?.value?.[0]?.items;
            return !Array.isArray(items) || items.length > 0;
        } catch (e) {
            return console.warn('Erreur parsing panier :', e);
        }
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

    const injectOrder = (order) => {
        if (!Array.isArray(order))
            return alert('❌ Le JSON collé doit être un tableau d’items.');

        const currentCartRaw = localStorage.getItem('bags');
        const cart = JSON.parse(currentCartRaw);
        if (!cart?.value?.[0]) return alert('❌ Structure du panier invalide.');
        cart.value[0].items = order;
        localStorage.setItem('bags', JSON.stringify(cart));
    };

    if (!doesCartOrderAlreadyExists()) createBags();
    const orderFromUrl = getJsonOrderFromUrl();
    injectOrder(orderFromUrl);
})();
