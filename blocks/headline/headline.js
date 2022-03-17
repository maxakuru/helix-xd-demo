const init = (element) => {
    const header = document.querySelector('.headline');

    const container = element.querySelector(':scope > div');
    container.classList.add('container');

    const ribbon = element.querySelector(':scope > div:last-of-type > div');
    ribbon.classList.add('ribbon');
    const bgImg = ribbon.querySelector(':scope img');
    if (!bgImg) {
        const bgColor = ribbon.textContent;
        ribbon.style = `background: ${bgColor}`;
        ribbon.innerHTML = '';
    }

};

export default init;
