(() => {
    const configPath404 = () => {
        return "404";
    };

    const configPath404Fragment = () => {
        return "404.fragment"
    };

    const configPathScript = () => {
        return "script";
    };

    const configPathStyle = () => {
        return "style";
    };

    const configReplaceLocation = (location) => {
        return configReplacePathname(location)
            .replace(/(^|\/)$/, "$1index");
    };

    const configReplacePathname = (pathname) => {
        return pathname
            .replace(document.baseURI, "")
            .replace(document.location.hash, "")
            .replace(document.location.search, "")
            .replace(/(^|\/)([^/]+)$/, "$1$2/");
    };

    const configRoot = () => {
        return ".data/";
    };

    const main = () => {
        window.history.replaceState(null, "",
            configReplacePathname(window.location.href) + window.location.search + window.location.hash);

        Promise.all([
            promiseDomContentLoaded(),
            promiseLoadBody(
                `${configRoot()}${configReplaceLocation(window.location.href)}.html`,
                `${configRoot()}${configPath404()}.html`),
            promiseLoadStyle(`${configRoot()}${configPathStyle()}.css`),
            promiseLoadStyle(`${configRoot()}${configReplaceLocation(window.location.href)}.css`),
            promiseLoadScript(`${configRoot()}${configPathScript()}.js`),
            promiseLoadScript(`${configRoot()}${configReplaceLocation(window.location.href)}.js`),
        ]).then((response) => {
            while (response[1].hasChildNodes()) {
                document.body.appendChild(response[1].firstChild);
            }

            document.head.appendChild(response[2]);
            document.head.appendChild(response[3]);

            response[4]();
            response[5]();
        });
    };

    const promiseDomContentLoaded = () => {
        return new Promise((resolve) => {
            document.addEventListener("DOMContentLoaded", resolve);
        });
    };

    const promiseLoadBody = (location, fallback) => {
        return fetch(location).then((response) => {
            return response.ok ? response : fetch(fallback);
        }).then((response) => {
            return response.text();
        }).then((response) => {
            const element = document.createElement("div");
            element.innerHTML = response
                .replace(/src="([^"]*)"/g, `src="${configRoot()}$1"`);

            return Promise.all([
                Promise.resolve(element),
                ...[...element.querySelectorAll("[data-replace]")].map((value) => {
                    const nextSibling = value.nextSibling;
                    const parentNode = value.parentNode;
                    parentNode.removeChild(value);

                    return promiseLoadBody(
                        `${configRoot()}${configReplaceLocation(value.dataset.replace)}.html`,
                        `${configRoot()}${configPath404Fragment()}.html`).then((response) => {
                        while (response.hasChildNodes()) {
                            parentNode.insertBefore(response.firstChild, nextSibling);
                        }
                    });
                }),
            ]);
        }).then((response) => {
            return response[0];
        });
    };

    const promiseLoadScript = (location) => {
        return fetch(location).then((response) => {
            return response.ok ? response.text() : null;
        }).then((response) => {
            return new Function(response !== null ? response : "");
        });
    };

    const promiseLoadStyle = (location) => {
        return fetch(location).then((response) => {
            return response.ok ? response.text() : null;
        }).then((response) => {
            const element = document.createElement("style");
            element.innerHTML = (response !== null ? response : "")
                .replace(/\r?\n/g, " ")
                .replace(/\s{2,}/g, " ")
                .trim();
            return element;
        });
    };

    main();
})();
