(() => {
    'use strict';

    /**
     * TDR — Navbar
     *
     * Builds the fixed header bar and the slide-out menu markup, then
     * tdr-menu.js (which must load after this file) wires up the behavior.
     *
     * Content comes from window.TDR_NAV, set in the Squarespace site-wide
     * code injection (below the tdr.css / tdr.js includes), so the banner
     * text, ticket link and menu links can be changed without a commit:
     *
     *   <script>
     *   window.TDR_NAV = {
     *       lines: ['The Pulitzer Prize Finalist On', 'Broadway for 16 Weeks Only'],
     *       ticketsUrl: 'https://example.com/tickets',   // '' = no button
     *       ticketsLabel: 'Get Tickets',                 // optional
     *       links: [
     *           { label: 'Home',    href: '/' },
     *           { label: 'Tickets', href: '/tickets' }
     *       ]
     *   };
     *   </script>
     *
     * - lines:        one or two lines of centered text (an array; a single
     *                 string also works). Empty = no center text.
     * - ticketsUrl:   '' (or missing) means the button is not printed.
     * - ticketsLabel: button text. Defaults to "Get Tickets".
     * - links:        slide-out menu items, in order. The link matching the
     *                 current page gets aria-current="page".
     *
     * All text is inserted as text (never HTML).
     */

    const MODULE = '[TDR Navbar]';

    const config = window.TDR_NAV;

    if (!config) {
        console.warn(`${MODULE} window.TDR_NAV is not defined; header not built.`);
        return;
    }

    if (!document.body) {
        console.error(`${MODULE} document.body not available; header not built.`);
        return;
    }

    if (document.getElementById('tdr-header')) {
        return;
    }


    // ------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------

    const el = (tag, className, attributes = {}) => {
        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        Object.entries(attributes).forEach(([name, value]) => {
            node.setAttribute(name, value);
        });

        return node;
    };

    const toArray = value => {
        if (Array.isArray(value)) {
            return value;
        }

        return value ? [value] : [];
    };

    // Only allow normal link targets (no javascript: URLs, etc.).
    const SAFE_URL = /^(https?:\/\/|\/|#|mailto:|tel:)/i;

    const safeUrl = url => {
        const value = String(url || '').trim();

        return SAFE_URL.test(value) ? value : '';
    };

    const normalizePath = path => {
        return path.toLowerCase().replace(/\/+$/, '') || '/';
    };

    const isCurrentPage = href => {
        try {
            const url = new URL(href, window.location.href);

            return (
                url.origin === window.location.origin &&
                normalizePath(url.pathname) === normalizePath(window.location.pathname)
            );
        } catch (error) {
            return false;
        }
    };


    // ------------------------------------------------------------
    // CONTENT FROM CONFIG
    // ------------------------------------------------------------

    const lines =
        toArray(config.lines)
            .map(line => String(line).trim())
            .filter(Boolean);

    const ticketsUrl =
        safeUrl(config.ticketsUrl);

    const ticketsLabel =
        String(config.ticketsLabel || 'Get Tickets').trim();

    const links =
        toArray(config.links)
            .map(link => ({
                label: String((link && link.label) || '').trim(),
                href: safeUrl(link && link.href)
            }))
            .filter(link => link.label && link.href);


    // ------------------------------------------------------------
    // HEADER BAR
    // ------------------------------------------------------------

    const header = el('div', 'tdr-header', { id: 'tdr-header' });

    const toggle = el('button', 'tdr-menu-toggle', {
        type: 'button',
        'aria-label': 'Open menu',
        'aria-controls': 'tdr-menu',
        'aria-expanded': 'false'
    });

    toggle.append(el('span'), el('span'), el('span'));

    // The title and link wrappers are always printed (even when empty) so the
    // three-column layout keeps the center text centered.
    const title = el('div', 'tdr-header-title');

    lines.forEach(text => {
        const line = el('span', 'tdr-header-line');
        line.textContent = text;
        title.append(line);
    });

    const linkWrap = el('div', 'tdr-header-link');

    if (ticketsUrl) {
        const ticketLink = el('a', '', {
            href: ticketsUrl,
            target: '_blank',
            rel: 'noopener noreferrer'
        });

        ticketLink.textContent = ticketsLabel;
        linkWrap.append(ticketLink);
    }

    header.append(toggle, title, linkWrap);


    // ------------------------------------------------------------
    // SLIDE-OUT MENU
    // ------------------------------------------------------------

    const overlay = el('div', 'tdr-menu-overlay', { 'aria-hidden': 'true' });

    const menu = el('nav', 'tdr-menu', {
        id: 'tdr-menu',
        'aria-label': 'Main navigation',
        'aria-hidden': 'true'
    });

    const closeButton = el('button', 'tdr-menu-close', {
        type: 'button',
        'aria-label': 'Close menu'
    });

    closeButton.append(el('span'), el('span'));

    const inner = el('div', 'tdr-menu-inner');
    const list = el('ul', 'tdr-menu-list');

    links.forEach(link => {
        const item = el('li', 'tdr-menu-item');
        const anchor = el('a', 'tdr-menu-link', { href: link.href });

        anchor.textContent = link.label;

        if (isCurrentPage(link.href)) {
            anchor.setAttribute('aria-current', 'page');
        }

        item.append(anchor);
        list.append(item);
    });

    inner.append(list);
    menu.append(closeButton, inner);


    // ------------------------------------------------------------
    // INSERT
    // ------------------------------------------------------------

    document.body.prepend(header, overlay, menu);
    document.body.classList.add('tdr-has-nav');

    console.log(`${MODULE} Ready.`);

})();
