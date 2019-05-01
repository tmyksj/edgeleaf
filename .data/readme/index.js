(() => {
    fetch("README.md").then((response) => {
        return response.text();
    }).then((response) => {
        document.querySelector("pre").innerHTML = response;
    });
})();
