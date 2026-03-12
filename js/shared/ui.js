const UI = {
    showResult(element, message, type = 'success') {
        if (!element) return;
        
        element.innerHTML = message;
        element.className = `result ${type}`;
    },

    hideElement(element) {
        if (element) element.style.display = 'none';
    },

    showElement(element, display = 'inline-block') {
        if (element) element.style.display = display;
    },

    disableElement(element) {
        if (element) element.disabled = true;
    },

    enableElement(element) {
        if (element) element.disabled = false;
    },

    clearElement(element) {
        if (element) element.innerHTML = '';
    }
};
